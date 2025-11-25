// Script pour vérifier l'existence des tables nécessaires
const pool = require('./db');

const tables = [
  'departements',
  'specialites',
  'matieres',
  'salles',
  'groupes',
  'niveaux',
  'utilisateurs',
  'etudiants',
  'enseignants',
  'emploi_temps',
  'absences',
  'notes',
  'notifications',
  'messages',
  'rattrapages',
  'evenements'
];

async function checkTables() {
  console.log('🔍 Vérification des tables...\n');
  
  for (const table of tables) {
    try {
      const [rows] = await pool.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`✅ Table '${table}' existe`);
      } else {
        console.log(`❌ Table '${table}' N'EXISTE PAS`);
      }
    } catch (err) {
      console.log(`❌ Erreur lors de la vérification de '${table}':`, err.message);
    }
  }
  
  console.log('\n✅ Vérification terminée');
  process.exit(0);
}

checkTables().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

