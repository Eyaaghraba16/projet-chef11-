const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

// Données d'exemple pour les notes
const notes = [
  {
    id: 1,
    etudiantId: 1,
    matiere: 'Programmation Web',
    note: 16.5,
    coefficient: 3,
    type: 'Examen'
  },
  {
    id: 2,
    etudiantId: 1,
    matiere: 'Base de données',
    note: 14.0,
    coefficient: 2,
    type: 'DS'
  },
  {
    id: 3,
    etudiantId: 1,
    matiere: 'Réseaux informatiques',
    note: 15.5,
    coefficient: 2,
    type: 'Examen'
  }
];

// GET - Récupérer les notes
router.get('/', verifyToken, (req, res) => {
  try {
    // Dans une vraie application, filtrer selon l'étudiant connecté
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notes' });
  }
});

module.exports = router;
