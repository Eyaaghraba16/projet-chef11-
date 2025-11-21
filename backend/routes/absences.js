const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

// Données d'exemple pour les absences
let absences = [
  {
    id: 1,
    etudiantId: 1,
    matiere: 'Programmation Web',
    date: '2025-10-10',
    justifiee: false,
    motif: ''
  },
  {
    id: 2,
    etudiantId: 1,
    matiere: 'Base de données',
    date: '2025-10-12',
    justifiee: true,
    motif: 'Visite médicale'
  }
];

let absenceId = 3;

// GET - Récupérer les absences
router.get('/', verifyToken, (req, res) => {
  try {
    // Dans une vraie application, filtrer selon l'utilisateur
    res.json(absences);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des absences' });
  }
});

// POST - Signaler une absence (pour enseignant) ou demander une excuse (pour étudiant)
router.post('/', verifyToken, (req, res) => {
  try {
    const { matiere, date, motif } = req.body;

    const nouvelleAbsence = {
      id: absenceId++,
      etudiantId: req.user.id,
      matiere,
      date,
      justifiee: false,
      motif: motif || ''
    };

    absences.push(nouvelleAbsence);
    res.status(201).json({ message: 'Absence enregistrée', absence: nouvelleAbsence });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'absence' });
  }
});

// PUT - Valider/refuser une absence (pour enseignant)
router.put('/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const { justifiee } = req.body;

    const absence = absences.find(a => a.id === parseInt(id));
    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }

    absence.justifiee = justifiee;
    res.json({ message: 'Absence mise à jour', absence });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'absence' });
  }
});

module.exports = router;
