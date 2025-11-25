const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../db');

// ==========================
// 🔹 DEPARTEMENTS
// ==========================
router.get('/departements', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departements ORDER BY nom');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des départements' });
  }
});

// POST - Créer un département (admin)
router.post('/departements', verifyToken, async (req, res) => {
  try {
    console.log('🔵 POST /api/departements - Body:', JSON.stringify(req.body));
    console.log('🔵 Headers:', JSON.stringify(req.headers));
    console.log('🔵 User:', req.user);
    console.log('🔵 User Role:', req.user?.role);

    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      console.log('❌ Rôle non autorisé:', req.user.role);
      return res.status(403).json({ message: 'Accès non autorisé. Rôle requis: administratif ou admin. Rôle actuel: ' + req.user.role });
    }

    const { nom, description } = req.body;
    if (!nom) {
      return res.status(400).json({ message: 'Le nom est requis' });
    }

    const [result] = await pool.query(
      'INSERT INTO departements (nom, description) VALUES (?, ?)',
      [nom, description || null]
    );

    console.log('✅ Département créé avec ID:', result.insertId);
    res.status(201).json({ message: 'Département créé', id: result.insertId });
  } catch (err) {
    console.error('❌ Erreur POST /api/departements:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la création du département',
      error: err.message,
      code: err.code
    });
  }
});

// PUT - Modifier un département (admin)
router.put('/departements/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { nom, description } = req.body;

    await pool.query(
      'UPDATE departements SET nom = ?, description = ? WHERE id = ?',
      [nom, description, id]
    );

    res.json({ message: 'Département mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du département' });
  }
});

// DELETE - Supprimer un département (admin)
router.delete('/departements/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    await pool.query('DELETE FROM departements WHERE id = ?', [id]);
    res.json({ message: 'Département supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression du département' });
  }
});

// ==========================
// 🔹 SPECIALITES
// ==========================
router.get('/specialites', async (req, res) => {
  try {
    const { id_departement } = req.query;
    
    let query = `
      SELECT s.*, d.nom AS departement 
      FROM specialites s
      LEFT JOIN departements d ON s.id_departement = d.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filtrer par département si fourni
    if (id_departement) {
      query += ' AND s.id_departement = ?';
      params.push(id_departement);
    }
    
    query += ' ORDER BY d.nom, s.nom';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur GET /api/specialites:', err);
    res.status(500).json({ 
      message: 'Erreur lors du chargement des spécialités',
      error: err.message,
      code: err.code
    });
  }
});

// POST - Créer une spécialité (admin)
router.post('/specialites', verifyToken, async (req, res) => {
  try {
    console.log('🔵 POST /api/specialites - Body:', req.body);
    console.log('🔵 User:', req.user);

    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { nom, id_departement } = req.body;
    if (!nom || !id_departement) {
      return res.status(400).json({ message: 'Le nom et l\'ID du département sont requis' });
    }

    const [result] = await pool.query(
      'INSERT INTO specialites (nom, id_departement) VALUES (?, ?)',
      [nom, id_departement]
    );

    console.log('✅ Spécialité créée avec ID:', result.insertId);
    res.status(201).json({ message: 'Spécialité créée', id: result.insertId });
  } catch (err) {
    console.error('❌ Erreur POST /api/specialites:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la spécialité',
      error: err.message,
      code: err.code
    });
  }
});

// PUT - Modifier une spécialité (admin)
router.put('/specialites/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { nom, id_departement } = req.body;

    await pool.query(
      'UPDATE specialites SET nom = ?, id_departement = ? WHERE id = ?',
      [nom, id_departement, id]
    );

    res.json({ message: 'Spécialité mise à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la spécialité' });
  }
});

// DELETE - Supprimer une spécialité (admin)
router.delete('/specialites/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    await pool.query('DELETE FROM specialites WHERE id = ?', [id]);
    res.json({ message: 'Spécialité supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la spécialité' });
  }
});

// ==========================
// 🔹 MATIERES
// ==========================
router.get('/matieres', async (req, res) => {
  try {
    // La table matieres n'a pas id_departement, on récupère juste les matières
    const [rows] = await pool.query(`
      SELECT m.*, n.nom AS niveau
      FROM matieres m
      LEFT JOIN niveaux n ON m.id_niveau = n.id
      ORDER BY m.nom
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur GET /api/matieres:', err);
    res.status(500).json({ 
      message: 'Erreur lors du chargement des matières',
      error: err.message,
      code: err.code
    });
  }
});

// POST - Créer une matière (admin)
router.post('/matieres', verifyToken, async (req, res) => {
  try {
    console.log('🔵 POST /api/matieres - Body:', JSON.stringify(req.body));
    console.log('🔵 Headers:', JSON.stringify(req.headers));
    console.log('🔵 User:', req.user);
    console.log('🔵 User Role:', req.user?.role);

    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      console.log('❌ Rôle non autorisé:', req.user.role);
      return res.status(403).json({ message: 'Accès non autorisé. Rôle requis: administratif ou admin. Rôle actuel: ' + req.user.role });
    }

    const { nom, code, coefficient, id_niveau, id_enseignant, nombre_heures } = req.body;
    if (!nom || !code) {
      return res.status(400).json({ message: 'Le nom et le code sont requis' });
    }

    // Vérifier que id_niveau existe (requis dans la table)
    if (!id_niveau) {
      return res.status(400).json({ message: 'id_niveau est requis' });
    }

    const [result] = await pool.query(
      'INSERT INTO matieres (nom, code, coefficient, id_niveau, id_enseignant, nombre_heures) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, code, coefficient || 1, id_niveau, id_enseignant || null, nombre_heures || 0]
    );

    console.log('✅ Matière créée avec ID:', result.insertId);
    res.status(201).json({ message: 'Matière créée', id: result.insertId });
  } catch (err) {
    console.error('❌ Erreur POST /api/matieres:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la matière',
      error: err.message,
      code: err.code
    });
  }
});

// PUT - Modifier une matière (admin)
router.put('/matieres/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { nom, code, coefficient, id_niveau, id_enseignant, nombre_heures } = req.body;

    await pool.query(
      'UPDATE matieres SET nom = ?, code = ?, coefficient = ?, id_niveau = ?, id_enseignant = ?, nombre_heures = ? WHERE id = ?',
      [nom, code, coefficient, id_niveau, id_enseignant, nombre_heures, id]
    );

    res.json({ message: 'Matière mise à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la matière' });
  }
});

// DELETE - Supprimer une matière (admin)
router.delete('/matieres/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    await pool.query('DELETE FROM matieres WHERE id = ?', [id]);
    res.json({ message: 'Matière supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la matière' });
  }
});

// ==========================
// 🔹 SALLES
// ==========================
router.get('/salles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM salles ORDER BY nom');
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur GET /api/salles:', err);
    res.status(500).json({ 
      message: 'Erreur lors du chargement des salles',
      error: err.message,
      code: err.code,
      hint: err.code === 'ER_NO_SUCH_TABLE' ? 'La table salles n\'existe pas. Exécutez le script SQL tables_manquantes.sql' : ''
    });
  }
});

// POST - Créer une salle (admin)
router.post('/salles', verifyToken, async (req, res) => {
  try {
    console.log('🔵 POST /api/salles - Body:', JSON.stringify(req.body));
    console.log('🔵 Headers:', JSON.stringify(req.headers));
    console.log('🔵 User:', req.user);
    console.log('🔵 User Role:', req.user?.role);

    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      console.log('❌ Rôle non autorisé:', req.user.role);
      return res.status(403).json({ message: 'Accès non autorisé. Rôle requis: administratif ou admin. Rôle actuel: ' + req.user.role });
    }

    const { nom, capacite, type } = req.body;
    if (!nom) {
      return res.status(400).json({ message: 'Le nom est requis' });
    }

    const [result] = await pool.query(
      'INSERT INTO salles (nom, capacite, type) VALUES (?, ?, ?)',
      [nom, capacite || null, type || null]
    );

    console.log('✅ Salle créée avec ID:', result.insertId);
    res.status(201).json({ message: 'Salle créée', id: result.insertId });
  } catch (err) {
    console.error('❌ Erreur POST /api/salles:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la salle',
      error: err.message,
      code: err.code
    });
  }
});

// PUT - Modifier une salle (admin)
router.put('/salles/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { nom, capacite, type } = req.body;

    await pool.query(
      'UPDATE salles SET nom = ?, capacite = ?, type = ? WHERE id = ?',
      [nom, capacite, type, id]
    );

    res.json({ message: 'Salle mise à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la salle' });
  }
});

// DELETE - Supprimer une salle (admin)
router.delete('/salles/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    await pool.query('DELETE FROM salles WHERE id = ?', [id]);
    res.json({ message: 'Salle supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la salle' });
  }
});

// ==========================
// 🔹 NIVEAUX
// ==========================
router.get('/niveaux', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM niveaux ORDER BY nom');
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur GET /api/niveaux:', err);
    res.status(500).json({ 
      message: 'Erreur lors du chargement des niveaux',
      error: err.message
    });
  }
});

// ==========================
// 🔹 GROUPES
// ==========================
router.get('/groupes', async (req, res) => {
  try {
    const { id_specialite, id_departement } = req.query;
    
    // Vérifier si la colonne id_specialite existe
    let hasSpecialiteColumn = false;
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM groupes LIKE "id_specialite"');
      hasSpecialiteColumn = columns.length > 0;
    } catch (e) {
      // Si erreur, on continue sans cette colonne
      console.log('Colonne id_specialite n\'existe pas dans groupes, utilisation du filtrage par nom');
    }
    
    let query = `
      SELECT 
        g.*, 
        n.nom AS niveau
    `;
    
    // Ajouter la jointure avec spécialités seulement si la colonne existe
    if (hasSpecialiteColumn) {
      query += `, s.nom AS specialite, s.id AS id_specialite_group, s.id_departement AS id_departement_specialite
        FROM groupes g
        LEFT JOIN niveaux n ON g.id_niveau = n.id
        LEFT JOIN specialites s ON g.id_specialite = s.id
        WHERE 1=1
      `;
    } else {
      // Sinon, utiliser le nom du groupe pour déterminer la spécialité
      query += `
        FROM groupes g
        LEFT JOIN niveaux n ON g.id_niveau = n.id
        WHERE 1=1
      `;
    }
    
    const params = [];
    
    // Filtrer par spécialité si fourni
    if (id_specialite) {
      if (hasSpecialiteColumn) {
        // Filtrer uniquement les groupes qui ont cette spécialité
        query += ' AND g.id_specialite = ?';
        params.push(id_specialite);
      } else {
        // Si pas de colonne, filtrer par le nom de la spécialité dans le nom du groupe
        const [specRows] = await pool.query('SELECT nom FROM specialites WHERE id = ?', [id_specialite]);
        if (specRows.length > 0) {
          const specNom = specRows[0].nom.toLowerCase();
          // Chercher les groupes dont le nom contient le code de la spécialité
          // DSI pour "Développement de systèmes d'information"
          if (specNom.includes('développement') || specNom.includes('dsi') || specNom.includes('systeme')) {
            query += ' AND (g.nom LIKE ? OR g.nom LIKE ? OR g.nom LIKE ?)';
            params.push('%DSI%', '%dsi%', '%Dsi%');
          } 
          // RSI pour "Réseaux et Systèmes Informatiques"
          else if (specNom.includes('réseaux') || specNom.includes('rsi') || specNom.includes('reseau')) {
            query += ' AND (g.nom LIKE ? OR g.nom LIKE ? OR g.nom LIKE ?)';
            params.push('%RSI%', '%rsi%', '%Rsi%');
          } 
          // Pour d'autres spécialités, chercher le début du nom dans le nom du groupe
          else {
            const specCode = specNom.substring(0, 3).toUpperCase();
            query += ' AND (g.nom LIKE ? OR g.nom LIKE ?)';
            params.push(`%${specCode}%`, `%${specCode.toLowerCase()}%`);
          }
        }
      }
    } else {
      // Si aucune spécialité sélectionnée (1ère année - tranc commun)
      if (hasSpecialiteColumn) {
        query += ' AND g.id_specialite IS NULL';
        
        // TOUJOURS filtrer par département si fourni pour les groupes du tranc commun
        if (id_departement) {
          // Récupérer le nom du département pour filtrer par le nom du groupe
          const [deptRows] = await pool.query('SELECT nom FROM departements WHERE id = ?', [id_departement]);
          if (deptRows.length > 0) {
            const deptNom = deptRows[0].nom.toLowerCase().trim();
            console.log('🔵 Filtrage groupes tranc commun pour département:', deptNom);
            // Filtrer les groupes du tranc commun selon le département
            if (deptNom.includes('informatique')) {
              query += ' AND (g.nom LIKE ? OR g.nom LIKE ? OR g.nom LIKE ?)';
              params.push('TI%', 'ti%', 'Ti%');
              console.log('✅ Filtrage: groupes TI uniquement');
            } else if (deptNom.includes('électrique') || deptNom.includes('electrique')) {
              query += ' AND (g.nom LIKE ? OR g.nom LIKE ? OR g.nom LIKE ?)';
              params.push('EL%', 'el%', 'El%');
              console.log('✅ Filtrage: groupes EL uniquement');
            } else if (deptNom.includes('mécanique') || deptNom.includes('mecanique')) {
              query += ' AND (g.nom LIKE ? OR g.nom LIKE ? OR g.nom LIKE ?)';
              params.push('MEC%', 'mec%', 'Mec%');
              console.log('✅ Filtrage: groupes MEC uniquement');
            } else {
              console.log('⚠️ Département non reconnu, pas de filtre appliqué');
            }
          }
        } else {
          // Si pas de département fourni, ne montrer AUCUN groupe (sécurité)
          query += ' AND 1=0'; // Condition toujours fausse = aucun résultat
          console.log('⚠️ Pas de département fourni, aucun groupe du tranc commun affiché');
        }
      } else {
        // Si pas de colonne id_specialite, filtrer par nom pour les groupes du tranc commun
        if (id_departement) {
          // Récupérer le nom du département pour filtrer par le nom du groupe
          const [deptRows] = await pool.query('SELECT nom FROM departements WHERE id = ?', [id_departement]);
          if (deptRows.length > 0) {
            const deptNom = deptRows[0].nom.toLowerCase().trim();
            console.log('🔵 Filtrage groupes tranc commun pour département:', deptNom);
            // Filtrer les groupes du tranc commun selon le département
            if (deptNom.includes('informatique')) {
              query += ' AND (g.nom LIKE ? OR g.nom LIKE ? OR g.nom LIKE ?)';
              params.push('TI%', 'ti%', 'Ti%');
            } else if (deptNom.includes('électrique') || deptNom.includes('electrique')) {
              query += ' AND (g.nom LIKE ? OR g.nom LIKE ? OR g.nom LIKE ?)';
              params.push('EL%', 'el%', 'El%');
            } else if (deptNom.includes('mécanique') || deptNom.includes('mecanique')) {
              query += ' AND (g.nom LIKE ? OR g.nom LIKE ? OR g.nom LIKE ?)';
              params.push('MEC%', 'mec%', 'Mec%');
            }
          }
        } else {
          // Si pas de département fourni, ne montrer AUCUN groupe (sécurité)
          query += ' AND 1=0'; // Condition toujours fausse = aucun résultat
        }
      }
    }
    
    query += ' ORDER BY g.nom';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur GET /api/groupes:', err);
    res.status(500).json({ 
      message: 'Erreur lors du chargement des groupes',
      error: err.message
    });
  }
});

// POST - Créer un groupe (admin)
router.post('/groupes', verifyToken, async (req, res) => {
  try {
    console.log('🔵 POST /api/groupes - Body:', req.body);
    console.log('🔵 User:', req.user);

    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { nom, id_niveau, id_specialite } = req.body;
    if (!nom || !id_niveau) {
      return res.status(400).json({ message: 'Le nom et l\'ID du niveau sont requis' });
    }

    const [result] = await pool.query(
      'INSERT INTO groupes (nom, id_niveau, id_specialite) VALUES (?, ?, ?)',
      [nom, id_niveau, id_specialite || null]
    );

    console.log('✅ Groupe créé avec ID:', result.insertId);
    res.status(201).json({ message: 'Groupe créé', id: result.insertId });
  } catch (err) {
    console.error('❌ Erreur POST /api/groupes:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la création du groupe',
      error: err.message,
      code: err.code
    });
  }
});

// ==========================
// 🔹 ENSEIGNANTS
// ==========================
router.get('/enseignants', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id,
        e.id_utilisateur,
        e.id_departement,
        u.nom,
        u.prenom,
        u.email,
        u.login,
        d.nom AS departement
      FROM enseignants e
      INNER JOIN utilisateurs u ON e.id_utilisateur = u.id
      LEFT JOIN departements d ON e.id_departement = d.id
      ORDER BY u.nom, u.prenom
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des enseignants' });
  }
});

// POST - Créer un enseignant (admin) - Crée d'abord l'utilisateur puis l'enseignant
router.post('/enseignants', verifyToken, async (req, res) => {
  try {
    console.log('🔵 POST /api/enseignants - Body:', req.body);

    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { nom, prenom, email, mot_de_passe, id_departement } = req.body;
    
    if (!nom || !prenom || !email) {
      return res.status(400).json({ message: 'Nom, prénom et email sont requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const normalizedEmail = email.trim().toLowerCase();
    const login = normalizedEmail.split('@')[0];
    
    const [existingUser] = await pool.query(
      'SELECT * FROM utilisateurs WHERE LOWER(email) = ? OR LOWER(login) = ?',
      [normalizedEmail, login]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email ou login déjà utilisé' });
    }

    // Hash du mot de passe si fourni, sinon générer un mot de passe par défaut
    const bcrypt = require('bcryptjs');
    const defaultPassword = mot_de_passe || 'password123'; // À changer en production
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Créer l'utilisateur
    const [userResult] = await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, login, mot_de_passe, role, actif)
       VALUES (?, ?, ?, ?, ?, 'enseignant', 1)`,
      [nom, prenom, normalizedEmail, login, hashedPassword]
    );

    const userId = userResult.insertId;

    // Créer l'enseignant
    const [enseignantResult] = await pool.query(
      `INSERT INTO enseignants (id_utilisateur, id_departement, date_creation)
       VALUES (?, ?, NOW())`,
      [userId, id_departement || null]
    );

    console.log('✅ Enseignant créé avec ID:', enseignantResult.insertId);
    res.status(201).json({ 
      message: 'Enseignant créé', 
      id: enseignantResult.insertId,
      id_utilisateur: userId
    });
  } catch (err) {
    console.error('❌ Erreur POST /api/enseignants:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'enseignant',
      error: err.message,
      code: err.code
    });
  }
});

// DELETE - Supprimer un enseignant (admin)
router.delete('/enseignants/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    
    // Récupérer l'ID utilisateur
    const [enseignant] = await pool.query(
      'SELECT id_utilisateur FROM enseignants WHERE id = ?',
      [id]
    );

    if (enseignant.length === 0) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }

    const id_utilisateur = enseignant[0].id_utilisateur;

    // Supprimer l'enseignant puis l'utilisateur
    await pool.query('DELETE FROM enseignants WHERE id = ?', [id]);
    await pool.query('DELETE FROM utilisateurs WHERE id = ?', [id_utilisateur]);

    res.json({ message: 'Enseignant supprimé' });
  } catch (err) {
    console.error('❌ Erreur DELETE /api/enseignants:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'enseignant',
      error: err.message
    });
  }
});

// ==========================
// 🔹 ETUDIANTS
// ==========================
router.get('/etudiants', async (req, res) => {
  try {
    const { id_departement, id_specialite, id_groupe, search } = req.query;

    let query = `
      SELECT 
        e.*,
        u.nom,
        u.prenom,
        u.email,
        u.login,
        d.id AS id_departement,
        d.nom AS departement,
        s.nom AS specialite_nom,
        g.nom AS groupe_nom
      FROM etudiants e
      INNER JOIN utilisateurs u ON e.id_utilisateur = u.id
      LEFT JOIN specialites s ON e.id_specialite = s.id
      LEFT JOIN departements d ON s.id_departement = d.id
      LEFT JOIN groupes g ON e.id_groupe = g.id
      WHERE 1=1
    `;

    const params = [];

    if (id_departement) {
      query += ' AND d.id = ?';
      params.push(id_departement);
    }
    if (id_specialite) {
      query += ' AND e.id_specialite = ?';
      params.push(id_specialite);
    }
    if (id_groupe) {
      query += ' AND e.id_groupe = ?';
      params.push(id_groupe);
    }
    if (search) {
      query += ' AND (u.nom LIKE ? OR u.prenom LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.nom, u.prenom';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des étudiants' });
  }
});

// POST - Ajouter un étudiant (admin) - Crée d'abord l'utilisateur puis l'étudiant
router.post('/etudiants', verifyToken, async (req, res) => {
  try {
    console.log('🔵 POST /api/etudiants - Body:', req.body);

    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { nom, prenom, email, mot_de_passe, id_groupe, id_specialite, numero_etudiant, telephone, date_naissance, departement, specialite, niveau } = req.body;

    if (!nom || !prenom || !email || !id_groupe) {
      return res.status(400).json({ message: 'Nom, prénom, email et id_groupe sont requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const normalizedEmail = email.trim().toLowerCase();
    const login = normalizedEmail.split('@')[0];
    
    const [existingUser] = await pool.query(
      'SELECT * FROM utilisateurs WHERE LOWER(email) = ? OR LOWER(login) = ?',
      [normalizedEmail, login]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email ou login déjà utilisé' });
    }

    // Hash du mot de passe si fourni, sinon générer un mot de passe par défaut
    const bcrypt = require('bcryptjs');
    const defaultPassword = mot_de_passe || 'password123'; // À changer en production
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Créer l'utilisateur
    const [userResult] = await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, login, mot_de_passe, role, actif)
       VALUES (?, ?, ?, ?, ?, 'etudiant', 1)`,
      [nom, prenom, normalizedEmail, login, hashedPassword]
    );

    const userId = userResult.insertId;

    // Créer l'étudiant
    const [etudiantResult] = await pool.query(
      `INSERT INTO etudiants 
      (id_utilisateur, id_groupe, id_specialite, numero_etudiant, telephone, date_naissance, departement, specialite, niveau, date_creation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, id_groupe, id_specialite || null, numero_etudiant || null, telephone || null, date_naissance || null, departement || null, specialite || null, niveau || null]
    );

    console.log('✅ Étudiant créé avec ID:', etudiantResult.insertId);
    res.status(201).json({
      id: etudiantResult.insertId,
      id_utilisateur: userId,
      id_groupe,
      id_specialite,
      message: 'Étudiant créé avec succès'
    });
  } catch (err) {
    console.error('❌ Erreur POST /api/etudiants:', err);
    res.status(500).json({ 
      message: "Erreur lors de l'ajout de l'étudiant",
      error: err.message,
      code: err.code
    });
  }
});

// DELETE - Supprimer un étudiant (admin)
router.delete('/etudiants/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    
    // Récupérer l'ID utilisateur
    const [etudiant] = await pool.query(
      'SELECT id_utilisateur FROM etudiants WHERE id = ?',
      [id]
    );

    if (etudiant.length === 0) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    const id_utilisateur = etudiant[0].id_utilisateur;

    // Supprimer l'étudiant puis l'utilisateur
    await pool.query('DELETE FROM etudiants WHERE id = ?', [id]);
    await pool.query('DELETE FROM utilisateurs WHERE id = ?', [id_utilisateur]);

    res.json({ message: 'Étudiant supprimé' });
  } catch (err) {
    console.error('❌ Erreur DELETE /api/etudiants:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'étudiant',
      error: err.message
    });
  }
});

// ==========================
// 🔹 UTILISATEURS (messagerie)
// ==========================
router.get('/utilisateurs', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nom, prenom, email, role 
       FROM utilisateurs 
       WHERE actif = 1
       ORDER BY nom, prenom`
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur GET /api/utilisateurs:', err);
    res.status(500).json({ message: 'Erreur lors du chargement des utilisateurs' });
  }
});

module.exports = router;
