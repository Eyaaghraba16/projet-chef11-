const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../db');

// GET - Récupérer les rattrapages
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
      if (userRole === 'etudiant') {
        // Récupérer l'ID de l'étudiant
        const [etudiantRows] = await pool.query(
          'SELECT id FROM etudiants WHERE id_utilisateur = ?',
          [userId]
        );

        if (etudiantRows.length === 0) {
          return res.status(404).json({ message: 'Étudiant non trouvé' });
        }

        const id_etudiant = etudiantRows[0].id;

        // Récupérer les rattrapages pour cet étudiant (basé sur les matières où il a des absences)
        const [rattrapages] = await pool.query(`
          SELECT 
            r.id,
            r.date,
            r.heure_debut,
            r.heure_fin,
            r.statut,
            r.date_creation,
            m.nom AS matiere,
            m.code AS matiere_code,
            s.nom AS salle,
            CONCAT(u.nom, ' ', u.prenom) AS enseignant
          FROM rattrapages r
          INNER JOIN matieres m ON r.id_matiere = m.id
          LEFT JOIN salles s ON r.id_salle = s.id
          INNER JOIN enseignants en ON r.id_enseignant = en.id
          INNER JOIN utilisateurs u ON en.id_utilisateur = u.id
          WHERE r.id_etudiant = ? OR r.id_etudiant IS NULL
          ORDER BY r.date, r.heure_debut
        `, [id_etudiant]);

        res.json(rattrapages);
      } else if (userRole === 'enseignant') {
        const [enseignantRows] = await pool.query(
          'SELECT id FROM enseignants WHERE id_utilisateur = ?',
          [userId]
        );

        if (enseignantRows.length === 0) {
          return res.status(404).json({ message: 'Enseignant non trouvé' });
        }

        const id_enseignant = enseignantRows[0].id;

        const [rattrapages] = await pool.query(`
          SELECT 
            r.id,
            r.date,
            r.heure_debut,
            r.heure_fin,
            r.statut,
            r.date_creation,
            m.nom AS matiere,
            m.code AS matiere_code,
            s.nom AS salle,
            CONCAT(ue.nom, ' ', ue.prenom) AS etudiant
          FROM rattrapages r
          INNER JOIN matieres m ON r.id_matiere = m.id
          LEFT JOIN salles s ON r.id_salle = s.id
          LEFT JOIN etudiants e ON r.id_etudiant = e.id
          LEFT JOIN utilisateurs ue ON e.id_utilisateur = ue.id
          WHERE r.id_enseignant = ?
          ORDER BY r.date, r.heure_debut
        `, [id_enseignant]);

        res.json(rattrapages);
      } else {
        // Pour l'administration, retourner tous les rattrapages
        const [rattrapages] = await pool.query(`
          SELECT 
            r.id,
            r.date,
            r.heure_debut,
            r.heure_fin,
            r.statut,
            r.date_creation,
            m.nom AS matiere,
            m.code AS matiere_code,
            s.nom AS salle,
            CONCAT(u.nom, ' ', u.prenom) AS enseignant,
            CONCAT(ue.nom, ' ', ue.prenom) AS etudiant
          FROM rattrapages r
          INNER JOIN matieres m ON r.id_matiere = m.id
          LEFT JOIN salles s ON r.id_salle = s.id
          INNER JOIN enseignants en ON r.id_enseignant = en.id
          INNER JOIN utilisateurs u ON en.id_utilisateur = u.id
          LEFT JOIN etudiants e ON r.id_etudiant = e.id
          LEFT JOIN utilisateurs ue ON e.id_utilisateur = ue.id
          ORDER BY r.date, r.heure_debut
        `);

        res.json(rattrapages);
      }
    } catch (error) {
      // Si la table n'existe pas, retourner un tableau vide
      console.log('Table rattrapages non trouvée');
      res.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur GET /rattrapages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rattrapages' });
  }
});

// POST - Proposer un rattrapage (enseignant/admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'enseignant' && userRole !== 'administratif' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id_matiere, id_salle, date, heure_debut, heure_fin, id_etudiant } = req.body;

    if (!id_matiere || !date || !heure_debut || !heure_fin) {
      return res.status(400).json({ message: 'id_matiere, date, heure_debut et heure_fin sont requis' });
    }

    // Récupérer l'ID de l'enseignant
    const [enseignantRows] = await pool.query(
      'SELECT id FROM enseignants WHERE id_utilisateur = ?',
      [req.user.id]
    );

    if (enseignantRows.length === 0 && userRole === 'enseignant') {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }

    const id_enseignant = enseignantRows.length > 0 ? enseignantRows[0].id : null;

    try {
      const [result] = await pool.query(
        `INSERT INTO rattrapages (id_matiere, id_salle, id_enseignant, id_etudiant, date, heure_debut, heure_fin, statut, date_creation)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'planifie', NOW())`,
        [id_matiere, id_salle || null, id_enseignant, id_etudiant || null, date, heure_debut, heure_fin]
      );

      res.status(201).json({ message: 'Rattrapage proposé', id: result.insertId });
    } catch (error) {
      res.status(500).json({ message: 'Table rattrapages non disponible. Veuillez créer la table.' });
    }
  } catch (error) {
    console.error('❌ Erreur POST /rattrapages:', error);
    res.status(500).json({ message: 'Erreur lors de la proposition du rattrapage' });
  }
});

// PUT - Modifier un rattrapage (enseignant/admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'enseignant' && userRole !== 'administratif' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { date, heure_debut, heure_fin, id_salle, statut } = req.body;

    try {
      await pool.query(
        `UPDATE rattrapages 
         SET date = ?, heure_debut = ?, heure_fin = ?, id_salle = ?, statut = ?
         WHERE id = ?`,
        [date, heure_debut, heure_fin, id_salle, statut, id]
      );

      res.json({ message: 'Rattrapage mis à jour' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du rattrapage' });
    }
  } catch (error) {
    console.error('❌ Erreur PUT /rattrapages:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

module.exports = router;
