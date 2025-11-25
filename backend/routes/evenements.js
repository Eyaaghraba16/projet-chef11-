const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../db');

// GET - Récupérer tous les événements
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM evenements WHERE 1=1';
    const params = [];

    // Les étudiants voient seulement les événements publics
    if (req.user.role === 'etudiant') {
      query += ' AND (type = "public" OR type = "fermeture")';
    }

    query += ' ORDER BY date_debut DESC';

    try {
      const [evenements] = await pool.query(query, params);
      res.json(evenements);
    } catch (error) {
      // Si la table n'existe pas, retourner un tableau vide
      console.log('Table evenements non trouvée');
      res.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur GET /evenements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
  }
});

// POST - Créer un événement (admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('🔵 POST /api/evenements - Body:', JSON.stringify(req.body));
    console.log('🔵 Headers:', JSON.stringify(req.headers));
    console.log('🔵 User:', req.user);
    console.log('🔵 User Role:', req.user?.role);

    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      console.log('❌ Rôle non autorisé:', req.user.role);
      return res.status(403).json({ message: 'Accès non autorisé. Rôle requis: administratif ou admin. Rôle actuel: ' + req.user.role });
    }

    const { titre, description, type, date_debut, date_fin, lieu } = req.body;

    if (!titre || !type || !date_debut) {
      return res.status(400).json({ message: 'Titre, type et date_debut sont requis' });
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO evenements (titre, description, type, date_debut, date_fin, lieu, date_creation)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [titre, description || null, type, date_debut, date_fin || null, lieu || null]
      );

      console.log('✅ Événement créé avec ID:', result.insertId);
      res.status(201).json({ message: 'Événement créé', id: result.insertId });
    } catch (error) {
      console.error('❌ Erreur SQL POST /api/evenements:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la création de l\'événement',
        error: error.message,
        code: error.code
      });
    }
  } catch (error) {
    console.error('❌ Erreur POST /api/evenements:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'événement',
      error: error.message
    });
  }
});

// PUT - Modifier un événement (admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { titre, description, type, date_debut, date_fin, lieu } = req.body;

    try {
      await pool.query(
        `UPDATE evenements 
         SET titre = ?, description = ?, type = ?, date_debut = ?, date_fin = ?, lieu = ?
         WHERE id = ?`,
        [titre, description, type, date_debut, date_fin, lieu, id]
      );

      res.json({ message: 'Événement mis à jour' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
    }
  } catch (error) {
    console.error('❌ Erreur PUT /evenements:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// DELETE - Supprimer un événement (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;

    try {
      await pool.query('DELETE FROM evenements WHERE id = ?', [id]);
      res.json({ message: 'Événement supprimé' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement' });
    }
  } catch (error) {
    console.error('❌ Erreur DELETE /evenements:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

module.exports = router;

