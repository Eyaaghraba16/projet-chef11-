// models/index.js

const { Sequelize, DataTypes } = require('sequelize');

// ⚙️ Remplace par tes infos MySQL
const sequelize = new Sequelize('nom_de_ta_base', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

// ✅ Importation du modèle EmploiTemps
const EmploiTemps = require('./emploiTemps')(sequelize, DataTypes);

// ✅ Exportation
module.exports = { sequelize, EmploiTemps };
