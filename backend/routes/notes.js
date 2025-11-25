const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../db');

// GET - Récupérer les notes
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'etudiant') {
      // Récupérer les informations de l'étudiant (département, spécialité)
      const [etudiantRows] = await pool.query(`
        SELECT 
          e.id,
          e.departement,
          e.specialite,
          e.id_specialite,
          s.id_departement AS id_departement_specialite
        FROM etudiants e
        LEFT JOIN specialites s ON e.id_specialite = s.id
        WHERE e.id_utilisateur = ?
      `, [userId]);

      if (etudiantRows.length === 0) {
        console.error('❌ Étudiant non trouvé pour userId:', userId);
        return res.status(404).json({ 
          message: 'Étudiant non trouvé. Votre compte utilisateur existe mais aucun enregistrement étudiant n\'a été trouvé. Veuillez contacter l\'administration.',
          code: 'STUDENT_NOT_FOUND'
        });
      }

      const etudiant = etudiantRows[0];
      const id_etudiant = etudiant.id;
      
      console.log('🔵 Étudiant connecté (notes):', {
        id: id_etudiant,
        departement: etudiant.departement,
        specialite: etudiant.specialite,
        id_specialite: etudiant.id_specialite,
        id_departement_specialite: etudiant.id_departement_specialite
      });

      // Récupérer UNIQUEMENT les notes de cet étudiant
      // Pas de filtrage supplémentaire - l'étudiant voit toutes ses notes
      let query = `
        SELECT 
          n.id,
          n.note,
          n.type_evaluation,
          n.date_evaluation,
          n.date_creation,
          m.nom AS matiere,
          m.code AS matiere_code,
          m.coefficient,
          m.id_departement AS id_departement_matiere,
          d.nom AS departement
        FROM notes n
        INNER JOIN matieres m ON n.id_matiere = m.id
        LEFT JOIN departements d ON m.id_departement = d.id
        WHERE n.id_etudiant = ?
        ORDER BY n.date_evaluation DESC, m.nom
      `;
      
      const params = [id_etudiant];
      
      console.log('🔵 Requête notes:', query);
      console.log('🔵 Paramètres:', params);
      
      const [notes] = await pool.query(query, params);
      console.log('✅ Notes récupérées:', notes.length);

      res.json(notes);
    } else if (userRole === 'enseignant' || userRole === 'administratif' || userRole === 'admin') {
      // Pour les enseignants et admin, retourner toutes les notes avec filtres optionnels
      const { id_departement, id_specialite, id_etudiant } = req.query;
      
      let query = `
        SELECT 
          n.id,
          n.note,
          n.type_evaluation,
          n.date_evaluation,
          n.date_creation,
          m.nom AS matiere,
          m.code AS matiere_code,
          m.coefficient,
          CONCAT(u.nom, ' ', u.prenom) AS etudiant,
          e.id AS id_etudiant,
          e.departement AS departement_etudiant,
          e.specialite AS specialite_etudiant,
          s.nom AS specialite_nom,
          d.nom AS departement
        FROM notes n
        INNER JOIN etudiants e ON n.id_etudiant = e.id
        INNER JOIN utilisateurs u ON e.id_utilisateur = u.id
        INNER JOIN matieres m ON n.id_matiere = m.id
        LEFT JOIN departements d ON m.id_departement = d.id
        LEFT JOIN specialites s ON e.id_specialite = s.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (id_etudiant) {
        query += ' AND e.id = ?';
        params.push(id_etudiant);
      }
      
      if (id_departement) {
        query += ' AND (s.id_departement = ? OR e.departement LIKE ? OR m.id_departement = ?)';
        params.push(id_departement, `%${id_departement}%`, id_departement);
      }
      
      if (id_specialite) {
        query += ' AND e.id_specialite = ?';
        params.push(id_specialite);
      }
      
      query += ' ORDER BY n.date_evaluation DESC, m.nom';
      
      const [notes] = await pool.query(query, params);
      res.json(notes);
    } else {
      res.status(403).json({ message: 'Accès non autorisé' });
    }
  } catch (error) {
    console.error('❌ Erreur GET /notes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notes' });
  }
});

// GET - Statistiques personnelles pour un étudiant
router.get('/statistiques', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'etudiant') {
      return res.status(403).json({ message: 'Accès réservé aux étudiants' });
    }

    // Récupérer l'ID de l'étudiant
    const [etudiantRows] = await pool.query(
      'SELECT id FROM etudiants WHERE id_utilisateur = ?',
      [userId]
    );

    if (etudiantRows.length === 0) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    const id_etudiant = etudiantRows[0].id;

    // Récupérer les statistiques globales
    const [statsGlobales] = await pool.query(`
      SELECT 
        COUNT(*) AS nombre_notes,
        AVG(n.note) AS moyenne_generale,
        MIN(n.note) AS note_minimale,
        MAX(n.note) AS note_maximale,
        SUM(CASE WHEN n.note >= 10 THEN 1 ELSE 0 END) AS notes_validees,
        SUM(CASE WHEN n.note < 10 THEN 1 ELSE 0 END) AS notes_non_validees
      FROM notes n
      WHERE n.id_etudiant = ?
    `, [id_etudiant]);

    // Récupérer les statistiques par matière
    const [statsParMatiere] = await pool.query(`
      SELECT 
        m.id,
        m.nom AS matiere,
        m.code AS matiere_code,
        m.coefficient,
        COUNT(n.id) AS nombre_notes,
        AVG(n.note) AS moyenne_matiere,
        MIN(n.note) AS note_minimale,
        MAX(n.note) AS note_maximale,
        SUM(CASE WHEN n.note >= 10 THEN 1 ELSE 0 END) AS notes_validees
      FROM matieres m
      LEFT JOIN notes n ON m.id = n.id_matiere AND n.id_etudiant = ?
      WHERE n.id IS NOT NULL
      GROUP BY m.id, m.nom, m.code, m.coefficient
      ORDER BY m.nom
    `, [id_etudiant]);

    // Récupérer les statistiques par type d'évaluation
    const [statsParType] = await pool.query(`
      SELECT 
        type_evaluation,
        COUNT(*) AS nombre,
        AVG(note) AS moyenne
      FROM notes
      WHERE id_etudiant = ?
      GROUP BY type_evaluation
    `, [id_etudiant]);

    res.json({
      globales: statsGlobales[0] || {
        nombre_notes: 0,
        moyenne_generale: null,
        note_minimale: null,
        note_maximale: null,
        notes_validees: 0,
        notes_non_validees: 0
      },
      par_matiere: statsParMatiere,
      par_type: statsParType
    });
  } catch (error) {
    console.error('❌ Erreur GET /notes/statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// POST - Ajouter une note (enseignant/admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'enseignant' && userRole !== 'administratif' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id_etudiant, id_matiere, note, type_evaluation, date_evaluation } = req.body;

    if (!id_etudiant || !id_matiere || note === undefined) {
      return res.status(400).json({ message: 'id_etudiant, id_matiere et note sont requis' });
    }

    // Vérifier que la note est valide
    if (note < 0 || note > 20) {
      return res.status(400).json({ message: 'La note doit être entre 0 et 20' });
    }

    const [result] = await pool.query(
      `INSERT INTO notes (id_etudiant, id_matiere, note, type_evaluation, date_evaluation, date_creation)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id_etudiant, id_matiere, note, type_evaluation || 'controle', date_evaluation || new Date().toISOString().split('T')[0]]
    );

    res.status(201).json({ message: 'Note ajoutée', id: result.insertId });
  } catch (error) {
    console.error('❌ Erreur POST /notes:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la note' });
  }
});

// PUT - Modifier une note (enseignant/admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'enseignant' && userRole !== 'administratif' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { note, type_evaluation, date_evaluation } = req.body;

    if (note !== undefined && (note < 0 || note > 20)) {
      return res.status(400).json({ message: 'La note doit être entre 0 et 20' });
    }

    const updates = [];
    const params = [];

    if (note !== undefined) {
      updates.push('note = ?');
      params.push(note);
    }
    if (type_evaluation) {
      updates.push('type_evaluation = ?');
      params.push(type_evaluation);
    }
    if (date_evaluation) {
      updates.push('date_evaluation = ?');
      params.push(date_evaluation);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Aucune modification à apporter' });
    }

    params.push(id);

    await pool.query(
      `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Note mise à jour' });
  } catch (error) {
    console.error('❌ Erreur PUT /notes:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la note' });
  }
});

// DELETE - Supprimer une note (admin seulement)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    await pool.query('DELETE FROM notes WHERE id = ?', [id]);
    res.json({ message: 'Note supprimée' });
  } catch (error) {
    console.error('❌ Erreur DELETE /notes:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la note' });
  }
});

module.exports = router;
