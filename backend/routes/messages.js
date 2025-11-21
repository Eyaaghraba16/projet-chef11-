const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

// Données d'exemple pour les messages
let messages = [
  {
    id: 1,
    expediteur: 'Dr. Ahmed Ben Ali',
    destinataire: 'etudiant@exemple.com',
    sujet: 'Travail à rendre',
    contenu: 'N\'oubliez pas de rendre le TP pour vendredi',
    date: '2025-10-14',
    lu: false
  }
];

let messageId = 2;

// GET - Récupérer les messages
router.get('/', verifyToken, (req, res) => {
  try {
    // Dans une vraie application, filtrer selon l'utilisateur connecté
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
});

// POST - Envoyer un message
router.post('/', verifyToken, (req, res) => {
  try {
    const { destinataire, sujet, contenu } = req.body;

    const nouveauMessage = {
      id: messageId++,
      expediteur: req.user.email,
      destinataire,
      sujet,
      contenu,
      date: new Date().toISOString().split('T')[0],
      lu: false
    };

    messages.push(nouveauMessage);
    res.status(201).json({ message: 'Message envoyé', messageData: nouveauMessage });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
});

module.exports = router;
