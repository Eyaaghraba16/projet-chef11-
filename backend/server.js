// Importation des modules nécessaires
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Connexion MySQL via ton fichier db.js
const pool = require('./db'); // ✅ on utilise ton pool existant

// Importation des routes
const authRoutes = require('./routes/auth');
const emploiRoutes = require('./routes/emploi');
const absencesRoutes = require('./routes/absences');
const absencesEnseignantsRoutes = require('./routes/absencesEnseignants');
const notesRoutes = require('./routes/notes');
const notificationsRoutes = require('./routes/notifications');
const rattrapagesRoutes = require('./routes/rattrapages');
const messagesRoutes = require('./routes/messages');
const referentielsRoutes = require('./routes/referentiels');
const rapportsRoutes = require('./routes/rapports');
const evenementsRoutes = require('./routes/evenements');

// Création de l'application Express
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Test de la connexion MySQL
pool.getConnection()
  .then(conn => {
    console.log('✅ Connexion MySQL réussie');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion MySQL :', err);
  });

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/emploi-du-temps', emploiRoutes);
app.use('/api/absences', absencesRoutes);
app.use('/api/enseignants/absences', absencesEnseignantsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/rattrapages', rattrapagesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api', referentielsRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/evenements', evenementsRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: "Bienvenue sur l'API de gestion universitaire" });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 API disponible sur http://localhost:${PORT}`);
});
