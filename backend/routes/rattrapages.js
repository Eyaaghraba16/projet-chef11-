const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

// Données d'exemple pour les rattrapages
let rattrapages = [
  {
    id: 1,
    matiere: 'Base de données',
    enseignant: 'Dr. Fatma Trabelsi',
    date: '2025-10-20',
    heure: '09:00',
    salle: 'Salle 203',
    statut: 'Confirmé'
  }
];

let rattrapageId = 2;

// GET - Récupérer les rattrapages
router.get('/', verifyToken, (req, res) => {
  try {
    res.json(rattrapages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des rattrapages' });
  }
});

// POST - Proposer un rattrapage (pour enseignant)
router.post('/', verifyToken, (req, res) => {
  try {
    const { matiere, date, heure, salle } = req.body;

    const nouveauRattrapage = {
      id: rattrapageId++,
      matiere,
      enseignant: req.user.email,
      date,
      heure,
      salle,
      statut: 'En attente'
    };

    rattrapages.push(nouveauRattrapage);
    res.status(201).json({ message: 'Rattrapage proposé', rattrapage: nouveauRattrapage });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la proposition du rattrapage' });
  }
});

module.exports = router;
