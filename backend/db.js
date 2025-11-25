// backend/db.js
const mysql = require('mysql2/promise');

// ⚠️ À adapter selon ta configuration XAMPP
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // laisse vide si tu n’as pas défini de mot de passe root dans XAMPP
  database: 'gestion_universitaire', // nom de ta base
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
