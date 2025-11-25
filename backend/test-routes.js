// Script de test pour vérifier que les routes fonctionnent
const express = require('express');
const app = express();
const pool = require('./db');

app.use(express.json());

// Test simple sans authentification pour vérifier la connexion DB
app.post('/test/matieres', async (req, res) => {
  try {
    console.log('Test POST /test/matieres - Body:', req.body);
    const { nom, code, coefficient } = req.body;
    
    if (!nom || !code) {
      return res.status(400).json({ message: 'nom et code requis' });
    }

    const [result] = await pool.query(
      'INSERT INTO matieres (nom, code, coefficient, id_departement) VALUES (?, ?, ?, ?)',
      [nom, code, coefficient || 1, null]
    );

    console.log('✅ Matière créée avec ID:', result.insertId);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('❌ Erreur:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      code: err.code 
    });
  }
});

app.post('/test/salles', async (req, res) => {
  try {
    console.log('Test POST /test/salles - Body:', req.body);
    const { nom, capacite, type } = req.body;
    
    if (!nom) {
      return res.status(400).json({ message: 'nom requis' });
    }

    const [result] = await pool.query(
      'INSERT INTO salles (nom, capacite, type) VALUES (?, ?, ?)',
      [nom, capacite || null, type || null]
    );

    console.log('✅ Salle créée avec ID:', result.insertId);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('❌ Erreur:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      code: err.code 
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🧪 Serveur de test démarré sur le port ${PORT}`);
  console.log(`Testez avec:`);
  console.log(`curl -X POST http://localhost:${PORT}/test/matieres -H "Content-Type: application/json" -d '{"nom":"Test","code":"TEST"}'`);
  console.log(`curl -X POST http://localhost:${PORT}/test/salles -H "Content-Type: application/json" -d '{"nom":"Salle Test"}'`);
});

