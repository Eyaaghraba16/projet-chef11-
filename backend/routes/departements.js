const express = require('express');
const router = express.Router();
const pool = require('../db'); // ✅ Ton pool MySQL déjà créé

// ✅ Récupérer tous les départements
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departements');
    res.json(rows);
  } catch (err) {
    console.error('Erreur GET /departements:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Ajouter un département
router.post('/', async (req, res) => {
  const { nom } = req.body;
  if (!nom) return res.status(400).json({ message: 'Nom du département requis' });

  try {
    const [result] = await pool.query('INSERT INTO departements (nom) VALUES (?)', [nom]);
    res.json({ id: result.insertId, nom });
  } catch (err) {
    console.error('Erreur POST /departements:', err);
    res.status(500).json({ message: 'Erreur ajout département' });
  }
});

// ✅ Supprimer un département
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM departements WHERE id = ?', [id]);
    res.json({ message: 'Département supprimé' });
  } catch (err) {
    console.error('Erreur DELETE /departements:', err);
    res.status(500).json({ message: 'Erreur suppression' });
  }
});

module.exports = router;
