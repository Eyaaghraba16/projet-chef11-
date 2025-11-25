/**
 * Script pour tester les routes étudiant
 */

const pool = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

async function testStudentRoutes() {
  try {
    console.log('Test des routes etudiant...\n');

    // 1. Vérifier s'il y a des étudiants
    const [etudiants] = await pool.query(`
      SELECT 
        e.id,
        e.id_utilisateur,
        u.nom,
        u.prenom,
        u.email,
        u.login,
        e.departement,
        e.specialite,
        e.id_specialite,
        e.id_groupe,
        g.nom as groupe_nom
      FROM etudiants e
      LEFT JOIN utilisateurs u ON e.id_utilisateur = u.id
      LEFT JOIN groupes g ON e.id_groupe = g.id
      LIMIT 5
    `);

    console.log('Etudiants dans la base:');
    if (etudiants.length === 0) {
      console.log('  ❌ Aucun etudiant trouve dans la base de donnees!');
      console.log('  💡 Vous devez creer des etudiants via l\'interface admin ou l\'inscription.');
      return;
    }

    console.log(JSON.stringify(etudiants, null, 2));

    // 2. Tester avec le premier étudiant
    const etudiant = etudiants[0];
    console.log('\n🔵 Test avec l\'etudiant:', etudiant.nom, etudiant.prenom);

    // Créer un token JWT pour cet étudiant
    const token = jwt.sign(
      { id: etudiant.id_utilisateur, role: 'etudiant' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Token cree pour l\'etudiant');

    // 3. Tester la requête emploi du temps
    console.log('\n📅 Test emploi du temps:');
    try {
      const [emplois] = await pool.query(`
        SELECT 
          e.id, e.id_groupe, e.id_specialite, e.departement, e.specialite, e.niveau,
          s.id_departement AS id_departement_specialite,
          g.id_niveau,
          g.id_specialite AS id_specialite_groupe
        FROM etudiants e
        LEFT JOIN specialites s ON e.id_specialite = s.id
        LEFT JOIN groupes g ON e.id_groupe = g.id
        WHERE e.id_utilisateur = ?
      `, [etudiant.id_utilisateur]);

      if (emplois.length === 0) {
        console.log('  ❌ Etudiant non trouve pour id_utilisateur:', etudiant.id_utilisateur);
      } else {
        console.log('  ✅ Etudiant trouve:', emplois[0]);
        
        // Tester la requête emploi du temps
        const [emploiTemps] = await pool.query(`
          SELECT 
            et.id,
            et.date,
            et.heure_debut,
            et.heure_fin,
            g.nom AS groupe
          FROM emploi_temps et
          INNER JOIN groupes g ON et.id_groupe = g.id
          WHERE et.id_groupe = ? AND et.statut != 'annule'
          LIMIT 5
        `, [emplois[0].id_groupe]);
        
        console.log('  📊 Emplois du temps trouves:', emploiTemps.length);
      }
    } catch (err) {
      console.error('  ❌ Erreur:', err.message);
    }

    // 4. Tester la requête notes
    console.log('\n📝 Test notes:');
    try {
      const [notes] = await pool.query(`
        SELECT 
          e.id,
          e.id_utilisateur
        FROM etudiants e
        WHERE e.id_utilisateur = ?
      `, [etudiant.id_utilisateur]);

      if (notes.length === 0) {
        console.log('  ❌ Etudiant non trouve');
      } else {
        const [notesData] = await pool.query(`
          SELECT COUNT(*) as count FROM notes WHERE id_etudiant = ?
        `, [notes[0].id]);
        console.log('  📊 Notes trouvees:', notesData[0].count);
      }
    } catch (err) {
      console.error('  ❌ Erreur:', err.message);
    }

    // 5. Tester la requête absences
    console.log('\n🚫 Test absences:');
    try {
      const [absences] = await pool.query(`
        SELECT 
          e.id,
          e.id_utilisateur
        FROM etudiants e
        WHERE e.id_utilisateur = ?
      `, [etudiant.id_utilisateur]);

      if (absences.length === 0) {
        console.log('  ❌ Etudiant non trouve');
      } else {
        const [absencesData] = await pool.query(`
          SELECT COUNT(*) as count FROM absences WHERE id_etudiant = ?
        `, [absences[0].id]);
        console.log('  📊 Absences trouvees:', absencesData[0].count);
      }
    } catch (err) {
      console.error('  ❌ Erreur:', err.message);
    }

    console.log('\n✅ Tests termines');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testStudentRoutes();

