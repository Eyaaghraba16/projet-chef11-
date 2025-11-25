const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ Ajouter un étudiant
router.post('/', (req, res) => {
  const { nom, prenom, email, mot_de_passe, departement_id } = req.body;
  if (!nom || !prenom || !email || !mot_de_passe || !departement_id)
    return res.status(400).json({ message: "Tous les champs sont requis" });

  const sql = 'INSERT INTO etudiants (nom, prenom, email, mot_de_passe, departement_id) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nom, prenom, email, mot_de_passe, departement_id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: 'Étudiant ajouté avec succès' });
  });
});

// ✅ Obtenir tous les étudiants
router.get('/', (req, res) => {
  const sql = `
    SELECT e.*, d.nom AS departement_nom 
    FROM etudiants e 
    LEFT JOIN departements d ON e.departement_id = d.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

module.exports = router;
