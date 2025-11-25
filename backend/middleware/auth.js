const jwt = require('jsonwebtoken');

// Clé secrète (à mettre dans .env pour la prod)
const JWT_SECRET = 'votre_cle_secrete_changez_moi';

// Middleware pour vérifier le token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('🔐 verifyToken - Authorization header:', authHeader ? 'Présent' : 'Manquant');
  
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ verifyToken - Token manquant');
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ verifyToken - Token valide, user:', decoded);
    req.user = decoded; // contient l'id de l'utilisateur
    next();
  } catch (error) {
    console.log('❌ verifyToken - Token invalide:', error.message);
    return res.status(403).json({ message: 'Token invalide', error: error.message });
  }
}

module.exports = verifyToken;
