const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../db');

// GET - Récupérer les notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Vérifier si la table notifications existe, sinon utiliser une structure simple
    let notifications = [];

    try {
      // Essayer de récupérer depuis la table notifications si elle existe
      const [rows] = await pool.query(`
        SELECT * FROM notifications 
        WHERE id_utilisateur = ? OR id_utilisateur IS NULL
        ORDER BY date_creation DESC
      `, [userId]);
      notifications = rows;
    } catch (error) {
      // Si la table n'existe pas, créer des notifications basiques depuis d'autres tables
      console.log('Table notifications non trouvée, création de notifications dynamiques');

      // Notifications pour absences en attente
      if (userRole === 'etudiant') {
        const [etudiantRows] = await pool.query(
          'SELECT id FROM etudiants WHERE id_utilisateur = ?',
          [userId]
        );
        if (etudiantRows.length > 0) {
          const [absences] = await pool.query(`
            SELECT COUNT(*) AS count FROM absences 
            WHERE id_etudiant = ? AND statut = 'en_attente'
          `, [etudiantRows[0].id]);
          
          if (absences[0].count > 0) {
            notifications.push({
              id: 'abs_' + etudiantRows[0].id,
              titre: 'Absences en attente',
              message: `Vous avez ${absences[0].count} absence(s) en attente de validation`,
              type: 'absence',
              lu: false,
              date_creation: new Date()
            });
          }

          // Notification pour élimination par absentéisme
          const [absencesNonJustifiees] = await pool.query(`
            SELECT COUNT(*) AS count FROM absences 
            WHERE id_etudiant = ? AND statut = 'non_justifie'
          `, [etudiantRows[0].id]);
          
          const countNonJustifiees = absencesNonJustifiees[0].count;
          
          if (countNonJustifiees >= 10) {
            notifications.push({
              id: 'elim_' + etudiantRows[0].id,
              titre: '🚨 ÉLIMINATION POUR ABSENTÉISME',
              message: `CRITIQUE : Vous avez ${countNonJustifiees} absences non justifiées. Vous êtes éliminé(e) selon le règlement intérieur.`,
              type: 'elimination',
              lu: false,
              date_creation: new Date()
            });
          } else if (countNonJustifiees >= 7) {
            notifications.push({
              id: 'alerte_' + etudiantRows[0].id,
              titre: '⚠️ ALERTE CRITIQUE - Absentéisme',
              message: `ATTENTION : Vous avez ${countNonJustifiees} absences non justifiées. À partir de 10 absences, vous serez éliminé(e).`,
              type: 'alerte_critique',
              lu: false,
              date_creation: new Date()
            });
          } else if (countNonJustifiees >= 5) {
            notifications.push({
              id: 'avert_' + etudiantRows[0].id,
              titre: '⚠️ Avertissement - Absentéisme',
              message: `Attention : Vous avez ${countNonJustifiees} absences non justifiées. Veuillez régulariser votre situation.`,
              type: 'avertissement',
              lu: false,
              date_creation: new Date()
            });
          }
        }
      }

      // Notifications pour changements d'emploi du temps
      const [changements] = await pool.query(`
        SELECT COUNT(*) AS count FROM emploi_temps 
        WHERE statut IN ('annule', 'reporte') AND date >= CURDATE()
      `);
      
      if (changements[0].count > 0) {
        notifications.push({
          id: 'emploi_' + userId,
          titre: 'Changements d\'emploi du temps',
          message: `${changements[0].count} cours ont été modifiés ou annulés`,
          type: 'emploi_temps',
          lu: false,
          date_creation: new Date()
        });
      }
    }

    res.json(notifications);
  } catch (error) {
    console.error('❌ Erreur GET /notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
});

// POST - Créer une notification (admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'administratif' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { titre, message, type, id_utilisateur } = req.body;

    if (!titre || !message) {
      return res.status(400).json({ message: 'Titre et message sont requis' });
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO notifications (titre, message, type, id_utilisateur, lu, date_creation)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [titre, message, type || 'info', id_utilisateur || null]
      );
      res.status(201).json({ message: 'Notification créée', id: result.insertId });
    } catch (error) {
      // Si la table n'existe pas, retourner un message
      res.status(500).json({ message: 'Table notifications non disponible. Veuillez créer la table.' });
    }
  } catch (error) {
    console.error('❌ Erreur POST /notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la notification' });
  }
});

// PUT - Marquer une notification comme lue
router.put('/:id/lu', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      await pool.query(
        'UPDATE notifications SET lu = 1 WHERE id = ? AND id_utilisateur = ?',
        [id, userId]
      );
      res.json({ message: 'Notification marquée comme lue' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification' });
    }
  } catch (error) {
    console.error('❌ Erreur PUT /notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// GET - Compter les notifications non lues
router.get('/non-lues', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      const [rows] = await pool.query(
        'SELECT COUNT(*) AS count FROM notifications WHERE id_utilisateur = ? AND lu = 0',
        [userId]
      );
      res.json({ count: rows[0].count || 0 });
    } catch (error) {
      // Si la table n'existe pas, retourner 0
      res.json({ count: 0 });
    }
  } catch (error) {
    console.error('❌ Erreur GET /notifications/non-lues:', error);
    res.status(500).json({ message: 'Erreur lors du comptage' });
  }
});

module.exports = router;
