// models/emploiTemps.js

module.exports = (sequelize, DataTypes) => {
  const EmploiTemps = sequelize.define('EmploiTemps', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    heure_debut: {
      type: DataTypes.TIME,
      allowNull: false
    },
    heure_fin: {
      type: DataTypes.TIME,
      allowNull: false
    },
    id_salle: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_matiere: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_groupe: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_enseignant: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type_seance: {
      type: DataTypes.ENUM('cours', 'td', 'tp', 'examen'),
      defaultValue: 'cours'
    },
    statut: {
      type: DataTypes.ENUM('planifie', 'annule', 'reporte', 'termine'),
      defaultValue: 'planifie'
    },
    date_creation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'emploi_temps', 
    timestamps: false
  });

  return EmploiTemps;
};
