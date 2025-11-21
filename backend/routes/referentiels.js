const express = require('express');
const router = express.Router();
const pool = require('../db');

// ==========================
// 🔹 DEPARTEMENTS
// ==========================
router.get('/departements', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departements');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des départements' });
  }
});

// ==========================
// 🔹 ETUDIANTS
// ==========================
router.get('/etudiants', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, d.nom AS departement
      FROM etudiants e
      LEFT JOIN specialites s ON e.id_specialite = s.id
      LEFT JOIN departements d ON s.id_departement = d.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des étudiants' });
  }
});

// =======================================
// 🔹 AJOUT D'UN ÉTUDIANT (CORRIGÉ)
// =======================================
router.post('/etudiants', async (req, res) => {
  try {
    const { id_utilisateur, id_groupe, id_specialite, numero_etudiant, telephone, date_naissance } = req.body;

    if (!id_utilisateur || !id_groupe || !id_specialite)
      return res.status(400).json({ message: 'id_utilisateur, id_groupe et id_specialite sont requis' });

    const [result] = await pool.query(
      `
      INSERT INTO etudiants 
      (id_utilisateur, id_groupe, id_specialite, numero_etudiant, telephone, date_naissance)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [id_utilisateur, id_groupe, id_specialite, numero_etudiant, telephone, date_naissance]
    );

    res.json({
      id: result.insertId,
      id_utilisateur,
      id_groupe,
      id_specialite,
      numero_etudiant,
      telephone,
      date_naissance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'ajout de l'étudiant" });
  }
});

module.exports = router;
