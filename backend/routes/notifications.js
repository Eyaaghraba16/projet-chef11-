const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

// Données d'exemple pour les notifications
const notifications = [
  {
    id: 1,
    titre: 'Changement d\'emploi du temps',
    message: 'Le cours de Programmation Web de mardi est déplacé en salle 102',
    date: '2025-10-15',
    lu: false
  },
  {
    id: 2,
    titre: 'Rattrapage disponible',
    message: 'Un rattrapage pour Base de données est prévu samedi à 9h',
    date: '2025-10-14',
    lu: false
  },
  {
    id: 3,
    titre: 'Alerte absences',
    message: 'Vous avez accumulé 3 absences en Réseaux informatiques',
    date: '2025-10-13',
    lu: true
  }
];

// GET - Récupérer les notifications
router.get('/', verifyToken, (req, res) => {
  try {
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
});

module.exports = router;
