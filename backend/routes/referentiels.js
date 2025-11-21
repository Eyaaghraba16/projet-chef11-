const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../db');

const DEFAULT_PASSWORD = 'Admin@123';

const handleDbError = (res, err, context) => {
  console.error(`❌ ${context}`, err);
  res.status(500).json({ message: `Erreur ${context.toLowerCase()}` });
};

const buildLogin = (email, fallback = 'user') => {
  if (email) {
    return email.split('@')[0].toLowerCase();
  }
  return `${fallback.toLowerCase()}_${Date.now()}`;
};

const createUtilisateur = async ({ nom, prenom, email, role }) => {
  const login = buildLogin(email, nom || 'user');
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const [result] = await pool.query(
    `INSERT INTO utilisateurs (nom, prenom, email, login, mot_de_passe, role, actif)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      (nom || '').trim(),
      (prenom || '').trim(),
      (email || '').trim().toLowerCase(),
      login,
      hashedPassword,
      role
    ]
  );

  return result.insertId;
};

// ==========================
// 🔹 DEPARTEMENTS
// ==========================
router.get('/departements', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nom FROM departements ORDER BY nom ASC');
    res.json(rows);
  } catch (err) {
    handleDbError(res, err, 'chargement des départements');
  }
});

router.post('/departements', async (req, res) => {
  const { nom } = req.body;
  if (!nom?.trim()) {
    return res.status(400).json({ message: 'Nom requis' });
  }

  try {
    const [result] = await pool.query('INSERT INTO departements (nom) VALUES (?)', [nom.trim()]);
    res.status(201).json({ id: result.insertId, nom: nom.trim() });
  } catch (err) {
    handleDbError(res, err, 'lors de l’ajout du département');
  }
});

router.delete('/departements/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM departements WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Département introuvable' });
    }
    res.json({ message: 'Département supprimé' });
  } catch (err) {
    handleDbError(res, err, 'lors de la suppression du département');
  }
});

// ==========================
// 🔹 SPECIALITES
// ==========================
router.get('/specialites', async (req, res) => {
  const { departementId } = req.query;
  const clauses = [];
  const params = [];

  if (departementId) {
    clauses.push('s.id_departement = ?');
    params.push(departementId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `
      SELECT s.id, s.nom, s.id_departement AS departementId, d.nom AS departement
      FROM specialites s
      INNER JOIN departements d ON s.id_departement = d.id
      ${where}
      ORDER BY s.nom ASC
      `,
      params
    );
    res.json(rows);
  } catch (err) {
    handleDbError(res, err, 'lors du chargement des spécialités');
  }
});

// ==========================
// 🔹 NIVEAUX
// ==========================
router.get('/niveaux', async (req, res) => {
  const { specialiteId } = req.query;
  const clauses = [];
  const params = [];

  if (specialiteId) {
    clauses.push('n.id_specialite = ?');
    params.push(specialiteId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `
      SELECT n.id, n.nom, n.id_specialite AS specialiteId, s.nom AS specialite
      FROM niveaux n
      INNER JOIN specialites s ON n.id_specialite = s.id
      ${where}
      ORDER BY n.nom ASC
      `,
      params
    );
    res.json(rows);
  } catch (err) {
    handleDbError(res, err, 'lors du chargement des niveaux');
  }
});

// ==========================
// 🔹 GROUPES
// ==========================
router.get('/groupes', async (req, res) => {
  const { niveauId } = req.query;
  const clauses = [];
  const params = [];

  if (niveauId) {
    clauses.push('g.id_niveau = ?');
    params.push(niveauId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `
      SELECT g.id, g.nom, g.id_niveau AS niveauId, n.nom AS niveau
      FROM groupes g
      INNER JOIN niveaux n ON g.id_niveau = n.id
      ${where}
      ORDER BY g.nom ASC
      `,
      params
    );
    res.json(rows);
  } catch (err) {
    handleDbError(res, err, 'lors du chargement des groupes');
  }
});

// ==========================
// 🔹 ETUDIANTS
// ==========================
router.get('/etudiants', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id,
        u.nom,
        u.prenom,
        u.email,
        e.numero_etudiant AS numeroEtudiant,
        g.nom AS groupe,
        s.nom AS specialite,
        d.nom AS departement
      FROM etudiants e
      INNER JOIN utilisateurs u ON e.id_utilisateur = u.id
      LEFT JOIN groupes g ON e.id_groupe = g.id
      LEFT JOIN specialites s ON e.id_specialite = s.id
      LEFT JOIN departements d ON s.id_departement = d.id
      ORDER BY u.nom ASC
    `);
    res.json(rows);
  } catch (err) {
    handleDbError(res, err, 'lors du chargement des étudiants');
  }
});

router.post('/etudiants', async (req, res) => {
  const {
    nom,
    prenom,
    email,
    numeroEtudiant,
    telephone,
    dateNaissance,
    groupeId,
    specialiteId
  } = req.body;

  if (!nom?.trim() || !prenom?.trim() || !email?.trim()) {
    return res.status(400).json({ message: 'Nom, prénom et email sont obligatoires' });
  }

  const idGroupe = Number(groupeId) || 1;
  const idSpecialite = Number(specialiteId) || 1;

  try {
    const userId = await createUtilisateur({ nom, prenom, email, role: 'etudiant' });

    await pool.query(
      `INSERT INTO etudiants (id_utilisateur, id_groupe, id_specialite, numero_etudiant, telephone, date_naissance)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        idGroupe,
        idSpecialite,
        numeroEtudiant?.trim() || null,
        telephone?.trim() || null,
        dateNaissance || null
      ]
    );

    res.status(201).json({ message: 'Étudiant créé', utilisateurId: userId });
  } catch (err) {
    handleDbError(res, err, 'lors de l’ajout de l’étudiant');
  }
});

router.delete('/etudiants/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id_utilisateur FROM etudiants WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Étudiant introuvable' });
    }

    const userId = rows[0].id_utilisateur;
    await pool.query('DELETE FROM utilisateurs WHERE id = ?', [userId]);

    res.json({ message: 'Étudiant supprimé' });
  } catch (err) {
    handleDbError(res, err, 'lors de la suppression de l’étudiant');
  }
});

// ==========================
// 🔹 ENSEIGNANTS
// ==========================
router.get('/enseignants', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ens.id,
        u.nom,
        u.prenom,
        u.email,
        ens.grade,
        ens.telephone,
        d.nom AS departement
      FROM enseignants ens
      INNER JOIN utilisateurs u ON ens.id_utilisateur = u.id
      LEFT JOIN departements d ON ens.id_departement = d.id
      ORDER BY u.nom ASC
    `);
    res.json(rows);
  } catch (err) {
    handleDbError(res, err, 'lors du chargement des enseignants');
  }
});

router.post('/enseignants', async (req, res) => {
  const { nom, prenom, email, telephone, departementId, grade } = req.body;
  if (!nom?.trim() || !prenom?.trim() || !email?.trim()) {
    return res.status(400).json({ message: 'Nom, prénom et email sont obligatoires' });
  }

  const idDepartement = Number(departementId) || 1;

  try {
    const userId = await createUtilisateur({ nom, prenom, email, role: 'enseignant' });

    await pool.query(
      `INSERT INTO enseignants (id_utilisateur, id_departement, grade, telephone)
       VALUES (?, ?, ?, ?)`,
      [userId, idDepartement, grade?.trim() || null, telephone?.trim() || null]
    );

    res.status(201).json({ message: 'Enseignant créé', utilisateurId: userId });
  } catch (err) {
    handleDbError(res, err, 'lors de l’ajout de l’enseignant');
  }
});

router.delete('/enseignants/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id_utilisateur FROM enseignants WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Enseignant introuvable' });
    }
    const userId = rows[0].id_utilisateur;
    await pool.query('DELETE FROM utilisateurs WHERE id = ?', [userId]);
    res.json({ message: 'Enseignant supprimé' });
  } catch (err) {
    handleDbError(res, err, 'lors de la suppression de l’enseignant');
  }
});

// ==========================
// 🔹 MATIERES
// ==========================
router.get('/matieres', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id,
        m.nom,
        m.code,
        m.coefficient,
        m.nombre_heures AS nombreHeures,
        n.nom AS niveau,
        u.nom AS enseignantNom,
        u.prenom AS enseignantPrenom
      FROM matieres m
      LEFT JOIN niveaux n ON m.id_niveau = n.id
      LEFT JOIN enseignants ens ON m.id_enseignant = ens.id
      LEFT JOIN utilisateurs u ON ens.id_utilisateur = u.id
      ORDER BY m.nom ASC
    `);
    res.json(rows);
  } catch (err) {
    handleDbError(res, err, 'lors du chargement des matières');
  }
});

router.post('/matieres', async (req, res) => {
  const { nom, code, coefficient, nombreHeures, niveauId, enseignantId } = req.body;
  if (!nom?.trim()) {
    return res.status(400).json({ message: 'Nom requis' });
  }

  const generatedCode = code?.trim() || `MAT-${Date.now()}`;
  const coeff = Number(coefficient) || 1.0;
  const heures = Number(nombreHeures) || 0;
  const idNiveau = Number(niveauId) || 1;
  const idEnseignant = enseignantId ? Number(enseignantId) : null;

  try {
    const [result] = await pool.query(
      `INSERT INTO matieres (nom, code, id_niveau, id_enseignant, coefficient, nombre_heures)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom.trim(), generatedCode, idNiveau, idEnseignant, coeff, heures]
    );
    res.status(201).json({ id: result.insertId, nom: nom.trim(), code: generatedCode });
  } catch (err) {
    handleDbError(res, err, 'lors de l’ajout de la matière');
  }
});

router.delete('/matieres/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM matieres WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Matière introuvable' });
    }
    res.json({ message: 'Matière supprimée' });
  } catch (err) {
    handleDbError(res, err, 'lors de la suppression de la matière');
  }
});

// ==========================
// 🔹 SALLES
// ==========================
router.get('/salles', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, code, nom, type, capacite FROM salles ORDER BY nom ASC');
    res.json(rows);
  } catch (err) {
    handleDbError(res, err, 'lors du chargement des salles');
  }
});

router.post('/salles', async (req, res) => {
  const { nom, code, type, capacite, equipements } = req.body;
  if (!nom?.trim()) {
    return res.status(400).json({ message: 'Nom requis' });
  }

  const generatedCode = code?.trim() || `SAL-${Date.now()}`;
  const salleType = type?.trim() || 'cours';
  const capacity = Number(capacite) || 30;

  try {
    const [result] = await pool.query(
      `INSERT INTO salles (code, nom, type, capacite, equipements)
       VALUES (?, ?, ?, ?, ?)`,
      [generatedCode, nom.trim(), salleType, capacity, equipements?.trim() || null]
    );
    res.status(201).json({ id: result.insertId, nom: nom.trim(), code: generatedCode });
  } catch (err) {
    handleDbError(res, err, 'lors de l’ajout de la salle');
  }
});

router.delete('/salles/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM salles WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Salle introuvable' });
    }
    res.json({ message: 'Salle supprimée' });
  } catch (err) {
    handleDbError(res, err, 'lors de la suppression de la salle');
  }
});

// ==========================
// 🔹 EVENEMENTS
// ==========================
router.get('/evenements', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, titre, description, type, date_debut AS dateDebut, date_fin AS dateFin, lieu
      FROM evenements
      ORDER BY date_debut DESC
    `);
    res.json(rows);
  } catch (err) {
    handleDbError(res, err, 'lors du chargement des événements');
  }
});

router.post('/evenements', async (req, res) => {
  const { titre, description, date, dateDebut, dateFin, type, lieu } = req.body;
  const dateStart = dateDebut || date;

  if (!titre?.trim() || !dateStart) {
    return res.status(400).json({ message: 'Titre et date sont obligatoires' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO evenements (titre, description, type, date_debut, date_fin, lieu)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        titre.trim(),
        description?.trim() || null,
        type?.trim() || 'autre',
        dateStart,
        dateFin || dateStart,
        lieu?.trim() || null
      ]
    );

    res.status(201).json({ id: result.insertId, titre: titre.trim() });
  } catch (err) {
    handleDbError(res, err, 'lors de l’ajout de l’événement');
  }
});

router.delete('/evenements/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM evenements WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Événement introuvable' });
    }
    res.json({ message: 'Événement supprimé' });
  } catch (err) {
    handleDbError(res, err, 'lors de la suppression de l’événement');
  }
});

// ==========================
// 🔹 RAPPORTS
// ==========================
router.get('/rapports', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        titre,
        type,
        periode,
        DATE_FORMAT(date_generation, '%Y-%m-%d') AS date_generation,
        resume
      FROM rapports
      ORDER BY date_generation DESC
    `);
    res.json(rows);
  } catch (err) {
    handleDbError(res, err, 'lors du chargement des rapports');
  }
});

router.get('/rapports/:id/pdf', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT titre, resume, contenu FROM rapports WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Rapport introuvable' });
    }

    const rapport = rows[0];
    const payload = Buffer.from(
      `Rapport: ${rapport.titre}\n\nRésumé:\n${rapport.resume || 'N/A'}\n\nContenu:\n${rapport.contenu || 'N/A'}`
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport_${req.params.id}.pdf`);
    res.send(payload);
  } catch (err) {
    handleDbError(res, err, 'lors du téléchargement du PDF');
  }
});

router.get('/rapports/:id/csv', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT titre, type, periode, resume FROM rapports WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Rapport introuvable' });
    }

    const rapport = rows[0];
    const csv = [
      'Titre;Type;Période;Résumé',
      `${rapport.titre};${rapport.type || ''};${rapport.periode || ''};"${(rapport.resume || '').replace(/"/g, '""')}"`
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=rapport_${req.params.id}.csv`);
    res.send(csv);
  } catch (err) {
    handleDbError(res, err, 'lors du téléchargement du CSV');
  }
});

module.exports = router;
