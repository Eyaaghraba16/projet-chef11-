/**
 * Script pour vérifier les utilisateurs et étudiants
 */

const pool = require('../db');

async function checkUsersStudents() {
  try {
    console.log('Verification des utilisateurs et etudiants...\n');

    // 1. Vérifier les utilisateurs avec rôle étudiant
    const [users] = await pool.query(`
      SELECT id, nom, prenom, email, login, role 
      FROM utilisateurs 
      WHERE role = 'etudiant' 
      ORDER BY id
    `);

    console.log('Utilisateurs avec role etudiant:', users.length);
    if (users.length > 0) {
      console.log(JSON.stringify(users, null, 2));
    }

    // 2. Vérifier les enregistrements dans la table etudiants
    const [etudiants] = await pool.query(`
      SELECT e.id, e.id_utilisateur, u.nom, u.prenom, u.email
      FROM etudiants e
      LEFT JOIN utilisateurs u ON e.id_utilisateur = u.id
      ORDER BY e.id
    `);

    console.log('\nEnregistrements dans la table etudiants:', etudiants.length);
    if (etudiants.length > 0) {
      console.log(JSON.stringify(etudiants, null, 2));
    }

    // 3. Trouver les utilisateurs étudiants sans enregistrement dans la table etudiants
    const [missing] = await pool.query(`
      SELECT u.id, u.nom, u.prenom, u.email
      FROM utilisateurs u
      WHERE u.role = 'etudiant'
      AND NOT EXISTS (
        SELECT 1 FROM etudiants e WHERE e.id_utilisateur = u.id
      )
    `);

    console.log('\nUtilisateurs etudiants sans enregistrement dans la table etudiants:', missing.length);
    if (missing.length > 0) {
      console.log(JSON.stringify(missing, null, 2));
      console.log('\n⚠️ Ces utilisateurs ne peuvent pas acceder a leurs donnees car ils n\'ont pas d\'enregistrement dans la table etudiants.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkUsersStudents();

