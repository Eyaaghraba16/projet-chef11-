const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../db');

// GET - Récupérer l'emploi du temps pour l'étudiant connecté
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'etudiant') {
      // Récupérer les informations de l'étudiant (groupe, spécialité, département)
      const [etudiantRows] = await pool.query(
        `SELECT 
          e.id, 
          e.id_groupe, 
          e.id_specialite, 
          e.departement, 
          e.specialite, 
          e.niveau,
          s.id_departement AS id_departement_specialite,
          g.id_niveau,
          g.id_specialite AS id_specialite_groupe
         FROM etudiants e
         LEFT JOIN specialites s ON e.id_specialite = s.id
         LEFT JOIN groupes g ON e.id_groupe = g.id
         WHERE e.id_utilisateur = ?`,
        [userId]
      );

      if (etudiantRows.length === 0) {
        console.error('❌ Étudiant non trouvé pour userId:', userId);
        return res.status(404).json({ 
          message: 'Étudiant non trouvé. Votre compte utilisateur existe mais aucun enregistrement étudiant n\'a été trouvé. Veuillez contacter l\'administration.',
          code: 'STUDENT_NOT_FOUND'
        });
      }

      const etudiant = etudiantRows[0];
      console.log('🔵 Étudiant connecté:', {
        id: etudiant.id,
        id_groupe: etudiant.id_groupe,
        id_specialite: etudiant.id_specialite,
        departement: etudiant.departement,
        id_departement_specialite: etudiant.id_departement_specialite
      });

      // Récupérer l'emploi du temps selon le groupe de l'étudiant
      // L'étudiant voit uniquement les cours de son groupe
      let query = `
        SELECT 
          et.id,
          et.date,
          et.heure_debut,
          et.heure_fin,
          et.type_seance,
          et.statut,
          m.nom AS matiere,
          m.code AS matiere_code,
          s.nom AS salle,
          CONCAT(u.nom, ' ', u.prenom) AS enseignant,
          g.nom AS groupe,
          sp.nom AS specialite,
          d.nom AS departement
        FROM emploi_temps et
        INNER JOIN matieres m ON et.id_matiere = m.id
        INNER JOIN salles s ON et.id_salle = s.id
        INNER JOIN enseignants en ON et.id_enseignant = en.id
        INNER JOIN utilisateurs u ON en.id_utilisateur = u.id
        INNER JOIN groupes g ON et.id_groupe = g.id
        LEFT JOIN specialites sp ON g.id_specialite = sp.id
        LEFT JOIN departements d ON sp.id_departement = d.id
        WHERE et.id_groupe = ? AND et.statut != 'annule'
        ORDER BY et.date, et.heure_debut
      `;

      const params = [etudiant.id_groupe];

      console.log('🔵 Requête emploi du temps:', query);
      console.log('🔵 Paramètres:', params);

      const [emploiRows] = await pool.query(query, params);
      console.log('✅ Emploi du temps récupéré:', emploiRows.length, 'cours');
      res.json(emploiRows);
    } else if (userRole === 'enseignant') {
      // Récupérer l'ID de l'enseignant
      const [enseignantRows] = await pool.query(
        'SELECT id FROM enseignants WHERE id_utilisateur = ?',
        [userId]
      );

      if (enseignantRows.length === 0) {
        console.error('❌ Enseignant non trouvé pour userId:', userId);
        return res.status(404).json({
          message: 'Enseignant non trouvé. Votre compte utilisateur existe mais aucun enregistrement enseignant n\'a été trouvé.',
          code: 'TEACHER_NOT_FOUND'
        });
      }

      const id_enseignant = enseignantRows[0].id;
      console.log('🔵 Enseignant connecté (emploi du temps):', { id_enseignant });

      const [emploiRows] = await pool.query(`
        SELECT 
          et.id,
          et.date,
          et.heure_debut,
          et.heure_fin,
          et.type_seance,
          et.statut,
          m.nom AS matiere,
          m.code AS matiere_code,
          s.nom AS salle,
          g.nom AS groupe,
          sp.nom AS specialite,
          d.nom AS departement
        FROM emploi_temps et
        INNER JOIN matieres m ON et.id_matiere = m.id
        INNER JOIN salles s ON et.id_salle = s.id
        INNER JOIN groupes g ON et.id_groupe = g.id
        LEFT JOIN specialites sp ON g.id_specialite = sp.id
        LEFT JOIN departements d ON sp.id_departement = d.id
        WHERE et.id_enseignant = ? AND et.statut != 'annule'
        ORDER BY et.date, et.heure_debut
      `, [id_enseignant]);

      res.json(emploiRows);
    } else if (userRole === 'administratif' || userRole === 'admin') {
      // Pour l'admin, retourner tous les emplois du temps
      const [emploiRows] = await pool.query(`
        SELECT 
          et.id,
          et.date,
          et.heure_debut,
          et.heure_fin,
          et.type_seance,
          et.statut,
          m.nom AS matiere,
          m.code AS matiere_code,
          s.nom AS salle,
          CONCAT(u.nom, ' ', u.prenom) AS enseignant,
          g.nom AS groupe,
          sp.nom AS specialite,
          d.nom AS departement
        FROM emploi_temps et
        INNER JOIN matieres m ON et.id_matiere = m.id
        INNER JOIN salles s ON et.id_salle = s.id
        INNER JOIN enseignants en ON et.id_enseignant = en.id
        INNER JOIN utilisateurs u ON en.id_utilisateur = u.id
        INNER JOIN groupes g ON et.id_groupe = g.id
        LEFT JOIN specialites sp ON g.id_niveau = sp.id
        LEFT JOIN departements d ON sp.id_departement = d.id
        ORDER BY et.date, et.heure_debut
      `);
      res.json(emploiRows);
    } else {
      res.status(403).json({ message: 'Accès non autorisé' });
    }
  } catch (error) {
    console.error('❌ Erreur /emploi-du-temps:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'emploi du temps' });
  }
});

// POST - Créer un emploi du temps (admin seulement)
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('🔵 POST /api/emploi-du-temps - Body:', JSON.stringify(req.body));
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

    const { date, heure_debut, heure_fin, id_salle, id_matiere, id_groupe, id_enseignant, type_seance, statut } = req.body;

    if (!date || !heure_debut || !heure_fin || !id_salle || !id_matiere || !id_groupe || !id_enseignant) {
      return res.status(400).json({ message: 'Tous les champs sont requis (date, heure_debut, heure_fin, id_salle, id_matiere, id_groupe, id_enseignant)' });
    }

    const [result] = await pool.query(
      `INSERT INTO emploi_temps (date, heure_debut, heure_fin, id_salle, id_matiere, id_groupe, id_enseignant, type_seance, statut, date_creation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [date, heure_debut, heure_fin, id_salle, id_matiere, id_groupe, id_enseignant, type_seance || 'cours', statut || 'planifie']
    );

    console.log('✅ Emploi du temps créé avec ID:', result.insertId);
    res.status(201).json({ message: 'Emploi du temps créé', id: result.insertId });
  } catch (error) {
    console.error('❌ Erreur POST /api/emploi-du-temps:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'emploi du temps',
      error: error.message,
      code: error.code
    });
  }
});

// PUT - Modifier un emploi du temps (admin seulement)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { date, heure_debut, heure_fin, id_salle, id_matiere, id_groupe, id_enseignant, type_seance, statut } = req.body;

    await pool.query(
      `UPDATE emploi_temps 
       SET date = ?, heure_debut = ?, heure_fin = ?, id_salle = ?, id_matiere = ?, 
           id_groupe = ?, id_enseignant = ?, type_seance = ?, statut = ?
       WHERE id = ?`,
      [date, heure_debut, heure_fin, id_salle, id_matiere, id_groupe, id_enseignant, type_seance, statut, id]
    );

    res.json({ message: 'Emploi du temps mis à jour' });
  } catch (error) {
    console.error('❌ Erreur PUT /emploi-du-temps:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'emploi du temps' });
  }
});

// DELETE - Supprimer un emploi du temps (admin seulement)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    await pool.query('DELETE FROM emploi_temps WHERE id = ?', [id]);
    res.json({ message: 'Emploi du temps supprimé' });
  } catch (error) {
    console.error('❌ Erreur DELETE /emploi-du-temps:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'emploi du temps' });
  }
});

module.exports = router;
