/**
 * Script pour créer les enregistrements étudiants manquants
 */

const pool = require('../db');

async function createMissingStudents() {
  try {
    console.log('Creation des enregistrements etudiants manquants...\n');

    // Trouver les utilisateurs étudiants sans enregistrement dans la table etudiants
    const [missing] = await pool.query(`
      SELECT u.id, u.nom, u.prenom, u.email
      FROM utilisateurs u
      WHERE u.role = 'etudiant'
      AND NOT EXISTS (
        SELECT 1 FROM etudiants e WHERE e.id_utilisateur = u.id
      )
    `);

    if (missing.length === 0) {
      console.log('✅ Tous les utilisateurs etudiants ont deja un enregistrement dans la table etudiants.');
      process.exit(0);
    }

    console.log(`Trouve ${missing.length} utilisateurs etudiants sans enregistrement.\n`);

    // Récupérer le premier groupe du tranc commun (TI1, TI2, TI3) pour L1
    const [groupes] = await pool.query(`
      SELECT id FROM groupes 
      WHERE id_niveau = (SELECT id FROM niveaux WHERE code = 'L1' LIMIT 1) 
      AND id_specialite IS NULL 
      AND nom LIKE 'TI%'
      LIMIT 1
    `);
    const id_groupe_default = groupes.length > 0 ? groupes[0].id : null;

    if (!id_groupe_default) {
      console.error('❌ Aucun groupe du tranc commun (L1) trouve. Veuillez executer le script init-all-departments.js');
      process.exit(1);
    }

    console.log(`Utilisation du groupe par defaut: ${id_groupe_default}\n`);

    // Récupérer le premier département (Informatique par défaut)
    const [depts] = await pool.query('SELECT id, nom FROM departements WHERE LOWER(nom) LIKE "%informatique%" LIMIT 1');
    const dept_default = depts.length > 0 ? depts[0] : null;

    // Pour les étudiants de 1ère année, on peut utiliser NULL pour id_specialite
    // Mais si la colonne ne l'accepte pas, on doit trouver une spécialité par défaut
    // Vérifier d'abord si id_specialite peut être NULL
    const [columns] = await pool.query("SHOW COLUMNS FROM etudiants WHERE Field = 'id_specialite'");
    const canBeNull = columns[0] && columns[0].Null === 'YES';

    let id_specialite_default = null;
    if (!canBeNull) {
      // Si id_specialite ne peut pas être NULL, prendre la première spécialité du département
      const [specs] = await pool.query(`
        SELECT id FROM specialites 
        WHERE id_departement = (SELECT id FROM departements WHERE LOWER(nom) LIKE "%informatique%" LIMIT 1) 
        LIMIT 1
      `);
      id_specialite_default = specs.length > 0 ? specs[0].id : null;
      console.log(`id_specialite ne peut pas etre NULL, utilisation de: ${id_specialite_default}\n`);
    }

    let created = 0;
    let errors = 0;

    for (const user of missing) {
      try {
        // Créer un enregistrement étudiant avec des valeurs par défaut
        // Pour 1ère année, on utilise NULL pour id_specialite si possible, sinon une spécialité par défaut
        await pool.query(
          `INSERT INTO etudiants 
          (id_utilisateur, id_groupe, id_specialite, departement, specialite, niveau, date_creation)
          VALUES (?, ?, ?, ?, NULL, 'L1', NOW())`,
          [
            user.id, 
            id_groupe_default, 
            id_specialite_default, 
            dept_default ? dept_default.nom : 'Informatique'
          ]
        );
        
        console.log(`✅ Etudiant cree pour: ${user.nom} ${user.prenom} (${user.email})`);
        created++;
      } catch (err) {
        console.error(`❌ Erreur pour ${user.nom} ${user.prenom}:`, err.message);
        errors++;
      }
    }

    console.log(`\n✅ Termine: ${created} etudiants crees, ${errors} erreurs`);

    // Vérification finale
    const [finalCheck] = await pool.query(`
      SELECT COUNT(*) as count FROM etudiants
    `);
    console.log(`\nTotal d'etudiants dans la base: ${finalCheck[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createMissingStudents();

