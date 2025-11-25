const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../db');

// GET - Récupérer les absences
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
      
      console.log('🔵 Étudiant connecté (absences):', {
        id: id_etudiant,
        departement: etudiant.departement,
        specialite: etudiant.specialite,
        id_specialite: etudiant.id_specialite,
        id_departement_specialite: etudiant.id_departement_specialite
      });

      // Récupérer UNIQUEMENT les absences de cet étudiant
      // Pas de filtrage supplémentaire - l'étudiant voit toutes ses absences
      let query = `
        SELECT 
          a.id,
          a.date_absence,
          a.motif,
          a.justificatif,
          a.statut,
          a.date_creation,
          m.nom AS matiere,
          m.code AS matiere_code,
          m.id_departement AS id_departement_matiere,
          dm.nom AS departement_matiere,
          et.date AS date_cours,
          et.heure_debut,
          et.heure_fin,
          CONCAT(u.nom, ' ', u.prenom) AS enseignant
        FROM absences a
        INNER JOIN emploi_temps et ON a.id_emploi_temps = et.id
        INNER JOIN matieres m ON et.id_matiere = m.id
        LEFT JOIN departements dm ON m.id_departement = dm.id
        INNER JOIN enseignants en ON et.id_enseignant = en.id
        INNER JOIN utilisateurs u ON en.id_utilisateur = u.id
        WHERE a.id_etudiant = ?
        ORDER BY a.date_absence DESC
      `;
      
      const params = [id_etudiant];
      
      console.log('🔵 Requête absences:', query);
      console.log('🔵 Paramètres:', params);
      
      const [absences] = await pool.query(query, params);
      console.log('✅ Absences récupérées:', absences.length);

      res.json(absences);
    } else if (userRole === 'enseignant') {
      const { statut } = req.query;

      const [enseignantRows] = await pool.query(
        'SELECT id FROM enseignants WHERE id_utilisateur = ?',
        [userId]
      );

      if (enseignantRows.length === 0) {
        return res.status(404).json({ message: 'Enseignant non trouvé' });
      }

      const idEnseignant = enseignantRows[0].id;

      let query = `
        SELECT 
          a.id,
          a.date_absence,
          a.motif,
          a.justificatif,
          a.statut,
          a.date_creation,
          m.nom AS matiere,
          m.code AS matiere_code,
          et.date AS date_cours,
          et.heure_debut,
          et.heure_fin,
          CONCAT(ue.nom, ' ', ue.prenom) AS etudiant,
          e.id AS id_etudiant,
          g.nom AS groupe
        FROM absences a
        INNER JOIN etudiants e ON a.id_etudiant = e.id
        INNER JOIN utilisateurs ue ON e.id_utilisateur = ue.id
        INNER JOIN emploi_temps et ON a.id_emploi_temps = et.id
        INNER JOIN matieres m ON et.id_matiere = m.id
        INNER JOIN groupes g ON et.id_groupe = g.id
        WHERE et.id_enseignant = ?
      `;

      const params = [idEnseignant];

      if (statut) {
        query += ' AND a.statut = ?';
        params.push(statut);
      }

      query += ' ORDER BY a.date_absence DESC';

      const [absences] = await pool.query(query, params);
      res.json(absences);
    } else if (userRole === 'administratif' || userRole === 'admin') {
      // Pour l'administration, retourner toutes les absences avec filtres optionnels
      const { id_departement, id_specialite, id_etudiant, statut } = req.query;
      
      let query = `
        SELECT 
          a.id,
          a.date_absence,
          a.motif,
          a.justificatif,
          a.statut,
          a.date_creation,
          m.nom AS matiere,
          m.code AS matiere_code,
          et.date AS date_cours,
          et.heure_debut,
          et.heure_fin,
          CONCAT(u.nom, ' ', u.prenom) AS enseignant,
          CONCAT(ue.nom, ' ', ue.prenom) AS etudiant,
          e.id AS id_etudiant,
          e.departement AS departement_etudiant,
          e.specialite AS specialite_etudiant,
          s.nom AS specialite_nom,
          d.nom AS departement_nom
        FROM absences a
        INNER JOIN etudiants e ON a.id_etudiant = e.id
        INNER JOIN utilisateurs ue ON e.id_utilisateur = ue.id
        LEFT JOIN specialites s ON e.id_specialite = s.id
        LEFT JOIN departements d ON s.id_departement = d.id
        INNER JOIN emploi_temps et ON a.id_emploi_temps = et.id
        INNER JOIN matieres m ON et.id_matiere = m.id
        INNER JOIN enseignants en ON et.id_enseignant = en.id
        INNER JOIN utilisateurs u ON en.id_utilisateur = u.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (id_etudiant) {
        query += ' AND e.id = ?';
        params.push(id_etudiant);
      }
      
      if (id_departement) {
        query += ' AND (s.id_departement = ? OR e.departement LIKE ?)';
        params.push(id_departement, `%${id_departement}%`);
      }
      
      if (id_specialite) {
        query += ' AND e.id_specialite = ?';
        params.push(id_specialite);
      }

      if (statut) {
        query += ' AND a.statut = ?';
        params.push(statut);
      }
      
      query += ' ORDER BY a.date_absence DESC';
      
      const [absences] = await pool.query(query, params);
      res.json(absences);
    } else {
      res.status(403).json({ message: 'Accès non autorisé' });
    }
  } catch (error) {
    console.error('❌ Erreur GET /absences:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des absences' });
  }
});

// POST - Signaler une absence (étudiant) ou enregistrer une absence (enseignant/admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id_emploi_temps, motif, justificatif, date_absence } = req.body;

    if (!id_emploi_temps || !date_absence) {
      return res.status(400).json({ message: 'id_emploi_temps et date_absence sont requis' });
    }

    let id_etudiant;

    if (userRole === 'etudiant') {
      // Récupérer l'ID de l'étudiant
      const [etudiantRows] = await pool.query(
        'SELECT id FROM etudiants WHERE id_utilisateur = ?',
        [userId]
      );

      if (etudiantRows.length === 0) {
        return res.status(404).json({ message: 'Étudiant non trouvé' });
      }

      id_etudiant = etudiantRows[0].id;
    } else if (userRole === 'enseignant' || userRole === 'administratif' || userRole === 'admin') {
      // Pour les enseignants/admin, l'ID de l'étudiant doit être fourni
      if (!req.body.id_etudiant) {
        return res.status(400).json({ message: 'id_etudiant est requis pour les enseignants/admin' });
      }
      id_etudiant = req.body.id_etudiant;
    } else {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Vérifier que l'emploi du temps existe
    const [emploiRows] = await pool.query(
      'SELECT id FROM emploi_temps WHERE id = ?',
      [id_emploi_temps]
    );

    if (emploiRows.length === 0) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }

    // Insérer l'absence
    const statut = userRole === 'etudiant' ? 'en_attente' : 'non_justifie';
    const [result] = await pool.query(
      `INSERT INTO absences (id_etudiant, id_emploi_temps, motif, justificatif, statut, date_absence, date_creation)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id_etudiant, id_emploi_temps, motif || null, justificatif || null, statut, date_absence]
    );

    res.status(201).json({ message: 'Absence enregistrée', id: result.insertId });
  } catch (error) {
    console.error('❌ Erreur POST /absences:', error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'absence' });
  }
});

// PUT - Valider/refuser une absence (enseignant/admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'enseignant' && userRole !== 'administratif' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { statut, motif } = req.body;

    if (!statut || !['non_justifie', 'en_attente', 'justifie', 'refuse'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    await pool.query(
      'UPDATE absences SET statut = ?, motif = COALESCE(?, motif) WHERE id = ?',
      [statut, motif, id]
    );

    res.json({ message: 'Absence mise à jour' });
  } catch (error) {
    console.error('❌ Erreur PUT /absences:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'absence' });
  }
});

// GET - Statistiques d'absences pour un étudiant
router.get('/statistiques/:id_etudiant', verifyToken, async (req, res) => {
  try {
    const { id_etudiant } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Vérifier que l'utilisateur a le droit de voir ces statistiques
    if (userRole === 'etudiant') {
      const [etudiantRows] = await pool.query(
        'SELECT id FROM etudiants WHERE id_utilisateur = ?',
        [userId]
      );
      if (etudiantRows.length === 0 || etudiantRows[0].id != id_etudiant) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    // Récupérer les statistiques
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_absences,
        SUM(CASE WHEN statut = 'justifie' THEN 1 ELSE 0 END) AS absences_justifiees,
        SUM(CASE WHEN statut = 'non_justifie' THEN 1 ELSE 0 END) AS absences_non_justifiees,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) AS absences_en_attente,
        SUM(CASE WHEN statut = 'refuse' THEN 1 ELSE 0 END) AS absences_refusees
      FROM absences
      WHERE id_etudiant = ?
    `, [id_etudiant]);

    res.json(stats[0] || {
      total_absences: 0,
      absences_justifiees: 0,
      absences_non_justifiees: 0,
      absences_en_attente: 0,
      absences_refusees: 0
    });
  } catch (error) {
    console.error('❌ Erreur GET /absences/statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

module.exports = router;
