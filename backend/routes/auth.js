const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();
const JWT_SECRET = 'votre_cle_secrete_changez_moi';

// ==================== INSCRIPTION ====================
router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role } = req.body;
    const login = email.split('@')[0].trim().toLowerCase();

    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await pool.query(
      'SELECT * FROM utilisateurs WHERE LOWER(email) = ? OR LOWER(login) = ?',
      [email.trim().toLowerCase(), login]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email ou login déjà utilisé' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Insertion dans la table utilisateurs
    const [result] = await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, login, mot_de_passe, role, actif)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nom, prenom, email.trim().toLowerCase(), login, hashedPassword, role]
    );

    const userId = result.insertId;

    // Insertion selon le rôle
    if (role === 'etudiant') {
      await pool.query(
        `INSERT INTO etudiants (id_utilisateur, id_groupe, date_creation)
         VALUES (?, 1, NOW())`,
        [userId]
      );
    } else if (role === 'enseignant') {
      await pool.query(
        `INSERT INTO enseignants (id_utilisateur, id_departement, date_creation)
         VALUES (?, 1, NOW())`,
        [userId]
      );
    }

    res.json({ message: 'Inscription réussie' });
  } catch (error) {
    console.error('❌ Erreur /register:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

// ==================== CONNEXION ====================
router.post('/login', async (req, res) => {
  try {
    let { loginOrEmail, mot_de_passe } = req.body;
    loginOrEmail = loginOrEmail.trim().toLowerCase();

    console.log('🟢 Tentative de connexion:', loginOrEmail);

    const [rows] = await pool.query(
      'SELECT * FROM utilisateurs WHERE LOWER(login) = ? OR LOWER(email) = ?',
      [loginOrEmail, loginOrEmail]
    );

    if (rows.length === 0) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

    console.log('✅ Connexion réussie:', user.login);
    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        login: user.login,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Erreur /login:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

module.exports = router;
