const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();
const JWT_SECRET = 'votre_cle_secrete_changez_moi';

// ==================== INSCRIPTION ====================
router.post('/register', async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      mot_de_passe,
      role,
      departement,
      specialite,
      niveau
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role.trim().toLowerCase();
    const login = normalizedEmail.split('@')[0];

    const departementValue = departement?.trim();
    const specialiteValue = specialite?.trim();
    const niveauValue = niveau?.trim();

    if (normalizedRole === 'etudiant') {
      if (!departementValue || !niveauValue) {
        return res.status(400).json({ message: 'Département et niveau sont requis pour un étudiant' });
      }
      // Les étudiants de 1ère année n'ont pas de spécialité
      if (niveauValue === '1' || niveauValue === '1ère année' || niveauValue === 'L1' || niveauValue === 'Première année') {
        // Pas de spécialité pour la 1ère année
      } else if (!specialiteValue) {
        return res.status(400).json({ message: 'Spécialité requise pour les étudiants de 2ème année et plus' });
      }
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await pool.query(
      'SELECT * FROM utilisateurs WHERE LOWER(email) = ? OR LOWER(login) = ?',
      [normalizedEmail, login]
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
      [nom, prenom, normalizedEmail, login, hashedPassword, normalizedRole]
    );

    const userId = result.insertId;

    // Insertion selon le rôle
    if (normalizedRole === 'etudiant') {
      // Récupérer l'ID du département
      const [deptRows] = await pool.query(
        'SELECT id FROM departements WHERE LOWER(nom) = ?',
        [departementValue.toLowerCase()]
      );
      
      if (deptRows.length === 0) {
        return res.status(400).json({ message: 'Département non trouvé' });
      }
      const id_departement = deptRows[0].id;

      // Récupérer l'ID de la spécialité (NULL pour 1ère année)
      let id_specialite = null;
      const isPremiereAnnee = niveauValue === '1' || niveauValue === '1ère année' || 
                              niveauValue === 'L1' || niveauValue === 'Première année' ||
                              niveauValue.toLowerCase().includes('1');
      
      if (!isPremiereAnnee && specialiteValue) {
        const [specRows] = await pool.query(
          'SELECT id FROM specialites WHERE LOWER(nom) = ? AND id_departement = ?',
          [specialiteValue.toLowerCase(), id_departement]
        );
        
        if (specRows.length === 0) {
          return res.status(400).json({ message: 'Spécialité non trouvée pour ce département' });
        }
        id_specialite = specRows[0].id;
      }

      // Récupérer ou créer un groupe par défaut pour ce niveau
      // Pour simplifier, on utilise le groupe 1 par défaut (à améliorer)
      const id_groupe = 1;

      await pool.query(
        `INSERT INTO etudiants (id_utilisateur, id_groupe, id_specialite, departement, specialite, niveau, date_creation)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [userId, id_groupe, id_specialite, departementValue, specialiteValue || null, niveauValue]
      );
    } else if (normalizedRole === 'enseignant') {
      // Récupérer l'ID du département
      let id_departement = 1; // Par défaut
      if (departementValue) {
        const [deptRows] = await pool.query(
          'SELECT id FROM departements WHERE LOWER(nom) = ?',
          [departementValue.toLowerCase()]
        );
        if (deptRows.length > 0) {
          id_departement = deptRows[0].id;
        }
      }
      
      await pool.query(
        `INSERT INTO enseignants (id_utilisateur, id_departement, date_creation)
         VALUES (?, ?, NOW())`,
        [userId, id_departement]
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
