const jwt = require('jsonwebtoken');

// Clé secrète (à mettre dans .env pour la prod)
const JWT_SECRET = 'votre_cle_secrete_changez_moi';

// Middleware pour vérifier le token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contient l'id de l'utilisateur
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide' });
  }
}

module.exports = verifyToken;
