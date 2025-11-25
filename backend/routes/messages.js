const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../db');

// GET - Récupérer les messages
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
      // Récupérer les messages reçus et envoyés
      const [messages] = await pool.query(`
        SELECT 
          m.id,
          m.sujet,
          m.contenu,
          m.date_envoi,
          m.lu,
          m.id_expediteur,
          m.id_destinataire,
          CONCAT(ue.nom, ' ', ue.prenom) AS expediteur,
          CONCAT(ud.nom, ' ', ud.prenom) AS destinataire,
          ue.email AS email_expediteur,
          ud.email AS email_destinataire
        FROM messages m
        INNER JOIN utilisateurs ue ON m.id_expediteur = ue.id
        INNER JOIN utilisateurs ud ON m.id_destinataire = ud.id
        WHERE m.id_destinataire = ? OR m.id_expediteur = ?
        ORDER BY m.date_envoi DESC
      `, [userId, userId]);

      res.json(messages);
    } catch (error) {
      // Si la table n'existe pas, retourner un tableau vide
      console.log('Table messages non trouvée');
      res.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur GET /messages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
});

// GET - Récupérer les messages reçus
router.get('/recus', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      const [messages] = await pool.query(`
        SELECT 
          m.id,
          m.sujet,
          m.contenu,
          m.date_envoi,
          m.lu,
          CONCAT(u.nom, ' ', u.prenom) AS expediteur,
          u.email AS email_expediteur
        FROM messages m
        INNER JOIN utilisateurs u ON m.id_expediteur = u.id
        WHERE m.id_destinataire = ?
        ORDER BY m.date_envoi DESC
      `, [userId]);

      res.json(messages);
    } catch (error) {
      res.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur GET /messages/recus:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
});

// GET - Récupérer les messages envoyés
router.get('/envoyes', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      const [messages] = await pool.query(`
        SELECT 
          m.id,
          m.sujet,
          m.contenu,
          m.date_envoi,
          m.lu,
          CONCAT(u.nom, ' ', u.prenom) AS destinataire,
          u.email AS email_destinataire
        FROM messages m
        INNER JOIN utilisateurs u ON m.id_destinataire = u.id
        WHERE m.id_expediteur = ?
        ORDER BY m.date_envoi DESC
      `, [userId]);

      res.json(messages);
    } catch (error) {
      res.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur GET /messages/envoyes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
});

// POST - Envoyer un message
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_destinataire, sujet, contenu } = req.body;

    if (!id_destinataire || !sujet || !contenu) {
      return res.status(400).json({ message: 'id_destinataire, sujet et contenu sont requis' });
    }

    // Vérifier que le destinataire existe
    const [destRows] = await pool.query(
      'SELECT id FROM utilisateurs WHERE id = ?',
      [id_destinataire]
    );

    if (destRows.length === 0) {
      return res.status(404).json({ message: 'Destinataire non trouvé' });
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO messages (id_expediteur, id_destinataire, sujet, contenu, lu, date_envoi)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [userId, id_destinataire, sujet, contenu]
      );

      res.status(201).json({ message: 'Message envoyé', id: result.insertId });
    } catch (error) {
      res.status(500).json({ message: 'Table messages non disponible. Veuillez créer la table.' });
    }
  } catch (error) {
    console.error('❌ Erreur POST /messages:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
});

// PUT - Marquer un message comme lu
router.put('/:id/lu', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      await pool.query(
        'UPDATE messages SET lu = 1 WHERE id = ? AND id_destinataire = ?',
        [id, userId]
      );
      res.json({ message: 'Message marqué comme lu' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du message' });
    }
  } catch (error) {
    console.error('❌ Erreur PUT /messages:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// GET - Compter les messages non lus
router.get('/non-lus', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      const [rows] = await pool.query(
        'SELECT COUNT(*) AS count FROM messages WHERE id_destinataire = ? AND lu = 0',
        [userId]
      );
      res.json({ count: rows[0].count || 0 });
    } catch (error) {
      res.json({ count: 0 });
    }
  } catch (error) {
    console.error('❌ Erreur GET /messages/non-lus:', error);
    res.status(500).json({ message: 'Erreur lors du comptage' });
  }
});

module.exports = router;
