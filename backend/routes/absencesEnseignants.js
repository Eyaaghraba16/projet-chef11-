const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../db');

const STATUTS_AUTORISES = ['en_attente', 'approuve', 'refuse', 'annule'];

async function getEnseignantId(userId) {
  const [rows] = await pool.query(
    'SELECT id FROM enseignants WHERE id_utilisateur = ?',
    [userId]
  );
  if (rows.length === 0) {
    return null;
  }
  return rows[0].id;
}

function computeDurationHours(dateDebut, heureDebut, dateFin, heureFin) {
  try {
    const start = new Date(`${dateDebut}T${heureDebut || '00:00'}`);
    const end = new Date(`${dateFin}T${heureFin || '23:59'}`);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) {
      return 0;
    }
    return +(diffMs / (1000 * 60 * 60)).toFixed(2);
  } catch (error) {
    console.warn('⚠️ Impossible de calculer la durée de l\'absence enseignant', error);
    return null;
  }
}

// GET - Liste des absences enseignants
router.get('/', verifyToken, async (req, res) => {
  try {
    const role = req.user.role;
    const { statut } = req.query;

    if (role !== 'enseignant' && role !== 'administratif' && role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    let query = `
      SELECT 
        ae.id,
        ae.date_debut,
        ae.date_fin,
        ae.heure_debut,
        ae.heure_fin,
        ae.motif,
        ae.statut,
        ae.commentaire,
        ae.duree_heures,
        ae.date_creation,
        ae.date_mise_a_jour,
        CONCAT(u.nom, ' ', u.prenom) AS enseignant
      FROM absences_enseignants ae
      INNER JOIN enseignants e ON ae.id_enseignant = e.id
      INNER JOIN utilisateurs u ON e.id_utilisateur = u.id
      WHERE 1=1
    `;

    const params = [];

    if (role === 'enseignant') {
      const enseignantId = await getEnseignantId(req.user.id);
      if (!enseignantId) {
        return res.status(404).json({ message: 'Enseignant non trouvé' });
      }
      query += ' AND ae.id_enseignant = ?';
      params.push(enseignantId);
    } else if (req.query.id_enseignant) {
      query += ' AND ae.id_enseignant = ?';
      params.push(req.query.id_enseignant);
    }

    if (statut && STATUTS_AUTORISES.includes(statut)) {
      query += ' AND ae.statut = ?';
      params.push(statut);
    }

    query += ' ORDER BY ae.date_debut DESC, ae.date_creation DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur GET /enseignants/absences:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des absences enseignants' });
  }
});

// POST - Déclarer une absence enseignant
router.post('/', verifyToken, async (req, res) => {
  try {
    const role = req.user.role;

    if (role !== 'enseignant' && role !== 'administratif' && role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { date_debut, date_fin, heure_debut, heure_fin, motif, id_enseignant } = req.body;

    if (!date_debut || !date_fin || !motif) {
      return res.status(400).json({ message: 'date_debut, date_fin et motif sont requis' });
    }

    if (new Date(date_fin) < new Date(date_debut)) {
      return res.status(400).json({ message: 'La date de fin doit être postérieure à la date de début' });
    }

    let cibleEnseignantId = id_enseignant || null;

    if (role === 'enseignant') {
      cibleEnseignantId = await getEnseignantId(req.user.id);
      if (!cibleEnseignantId) {
        return res.status(404).json({ message: 'Enseignant non trouvé' });
      }
    } else if (!cibleEnseignantId) {
      return res.status(400).json({ message: 'id_enseignant est requis pour l\'administration' });
    }

    const duree = computeDurationHours(date_debut, heure_debut, date_fin, heure_fin);

    const [result] = await pool.query(
      `INSERT INTO absences_enseignants 
        (id_enseignant, date_debut, date_fin, heure_debut, heure_fin, motif, statut, commentaire, duree_heures, date_creation)
       VALUES (?, ?, ?, ?, ?, ?, 'en_attente', NULL, ?, NOW())`,
      [cibleEnseignantId, date_debut, date_fin, heure_debut || null, heure_fin || null, motif, duree]
    );

    res.status(201).json({ message: 'Absence enseignant déclarée', id: result.insertId });
  } catch (error) {
    console.error('❌ Erreur POST /enseignants/absences:', error);
    res.status(500).json({ message: 'Erreur lors de la déclaration de l\'absence' });
  }
});

// PUT - Mettre à jour une absence enseignant
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const role = req.user.role;
    const { id } = req.params;
    const { statut, commentaire, motif } = req.body;

    if (role !== 'enseignant' && role !== 'administratif' && role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const [rows] = await pool.query(
      'SELECT id_enseignant FROM absences_enseignants WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Absence enseignant introuvable' });
    }

    const record = rows[0];
    let enseignantId = null;

    if (role === 'enseignant') {
      enseignantId = await getEnseignantId(req.user.id);
      if (!enseignantId || enseignantId !== record.id_enseignant) {
        return res.status(403).json({ message: 'Vous ne pouvez modifier que vos absences' });
      }
    }

    const updates = [];
    const params = [];

    if (statut) {
      if (!STATUTS_AUTORISES.includes(statut)) {
        return res.status(400).json({ message: 'Statut invalide' });
      }
      updates.push('statut = ?');
      params.push(statut);
    }

    if (commentaire !== undefined) {
      updates.push('commentaire = ?');
      params.push(commentaire || null);
    }

    if (motif !== undefined) {
      updates.push('motif = ?');
      params.push(motif);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Aucune donnée à mettre à jour' });
    }

    updates.push('date_mise_a_jour = NOW()');

    params.push(id);

    await pool.query(
      `UPDATE absences_enseignants SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Absence enseignant mise à jour' });
  } catch (error) {
    console.error('❌ Erreur PUT /enseignants/absences:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'absence' });
  }
});

module.exports = router;

