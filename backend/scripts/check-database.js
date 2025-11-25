/**
 * Script pour vérifier l'état de la base de données
 */

const pool = require('../db');

async function checkDatabase() {
  try {
    console.log('Verification de la base de donnees...\n');

    // Compter les enregistrements
    const [etudiants] = await pool.query('SELECT COUNT(*) as count FROM etudiants');
    const [emplois] = await pool.query('SELECT COUNT(*) as count FROM emploi_temps');
    const [absences] = await pool.query('SELECT COUNT(*) as count FROM absences');
    const [notes] = await pool.query('SELECT COUNT(*) as count FROM notes');
    const [groupes] = await pool.query('SELECT COUNT(*) as count FROM groupes');
    const [specialites] = await pool.query('SELECT COUNT(*) as count FROM specialites');

    console.log('Etat de la base de donnees:');
    console.log('  Etudiants:', etudiants[0].count);
    console.log('  Emplois du temps:', emplois[0].count);
    console.log('  Absences:', absences[0].count);
    console.log('  Notes:', notes[0].count);
    console.log('  Groupes:', groupes[0].count);
    console.log('  Specialites:', specialites[0].count);

    // Exemples d'étudiants
    const [etudExemples] = await pool.query(`
      SELECT 
        e.id, 
        u.nom, 
        u.prenom, 
        e.departement, 
        e.specialite, 
        g.nom as groupe,
        s.nom as specialite_nom
      FROM etudiants e 
      LEFT JOIN utilisateurs u ON e.id_utilisateur = u.id 
      LEFT JOIN groupes g ON e.id_groupe = g.id
      LEFT JOIN specialites s ON e.id_specialite = s.id
      LIMIT 5
    `);

    console.log('\nExemples d\'etudiants:');
    console.log(JSON.stringify(etudExemples, null, 2));

    // Exemples d'emplois du temps
    const [emploiExemples] = await pool.query(`
      SELECT 
        et.id,
        et.date,
        g.nom as groupe,
        m.nom as matiere
      FROM emploi_temps et
      LEFT JOIN groupes g ON et.id_groupe = g.id
      LEFT JOIN matieres m ON et.id_matiere = m.id
      LIMIT 5
    `);

    console.log('\nExemples d\'emplois du temps:');
    console.log(JSON.stringify(emploiExemples, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkDatabase();

