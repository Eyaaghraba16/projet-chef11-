/**
 * Script pour initialiser la structure ISET Tozeur
 * Crée les spécialités DSI/RSI et les groupes correspondants
 */

const pool = require('../db');

async function initStructure() {
  try {
    console.log('🚀 Initialisation de la structure ISET Tozeur...\n');

    // 1. Corriger la structure de la table niveaux
    // Rendre id_specialite nullable (les niveaux ne devraient pas être liés aux spécialités)
    try {
      await pool.query(`ALTER TABLE niveaux MODIFY COLUMN id_specialite int(11) DEFAULT NULL`);
      console.log('✅ Colonne id_specialite rendue nullable dans niveaux');
    } catch (err) {
      console.log('ℹ️ Colonne id_specialite déjà nullable ou erreur:', err.message);
    }

    // Ajouter la colonne code à niveaux si elle n'existe pas
    try {
      await pool.query(`
        ALTER TABLE niveaux 
        ADD COLUMN code varchar(20) DEFAULT NULL AFTER nom
      `);
      console.log('✅ Colonne code ajoutée à la table niveaux');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Colonne code existe déjà dans niveaux');
      } else {
        throw err;
      }
    }

    // 2. Créer les niveaux L1, L2, L3
    // Mettre à jour les codes pour les niveaux existants d'abord
    await pool.query(`UPDATE niveaux SET code = 'L1' WHERE (nom LIKE '%Licence 1%' OR nom LIKE '%L1%') AND (code IS NULL OR code = '')`);
    await pool.query(`UPDATE niveaux SET code = 'L2' WHERE (nom LIKE '%Licence 2%' OR nom LIKE '%L2%') AND (code IS NULL OR code = '')`);
    await pool.query(`UPDATE niveaux SET code = 'L3' WHERE (nom LIKE '%Licence 3%' OR nom LIKE '%L3%') AND (code IS NULL OR code = '')`);

    // Créer les niveaux s'ils n'existent pas
    const [l1Exists] = await pool.query(`SELECT id FROM niveaux WHERE code = 'L1' LIMIT 1`);
    if (l1Exists.length === 0) {
      await pool.query(`INSERT INTO niveaux (nom, code, id_specialite) VALUES ('Licence 1', 'L1', NULL)`);
    }

    const [l2Exists] = await pool.query(`SELECT id FROM niveaux WHERE code = 'L2' LIMIT 1`);
    if (l2Exists.length === 0) {
      await pool.query(`INSERT INTO niveaux (nom, code, id_specialite) VALUES ('Licence 2', 'L2', NULL)`);
    }

    const [l3Exists] = await pool.query(`SELECT id FROM niveaux WHERE code = 'L3' LIMIT 1`);
    if (l3Exists.length === 0) {
      await pool.query(`INSERT INTO niveaux (nom, code, id_specialite) VALUES ('Licence 3', 'L3', NULL)`);
    }
    console.log('✅ Niveaux L1, L2, L3 vérifiés/créés');

    // 3. Récupérer l'ID du département Informatique
    const [deptRows] = await pool.query(`SELECT id FROM departements WHERE LOWER(nom) LIKE '%informatique%' LIMIT 1`);
    if (deptRows.length === 0) {
      throw new Error('Département Informatique non trouvé');
    }
    const deptInfoId = deptRows[0].id;
    console.log(`✅ Département Informatique trouvé (ID: ${deptInfoId})`);

    // 4. Supprimer les anciennes spécialités génériques
    await pool.query(`DELETE FROM specialites WHERE id_departement = ? AND (nom = 'Informatique' OR nom LIKE '%Informatique%')`, [deptInfoId]);
    console.log('✅ Anciennes spécialités supprimées');

    // 5. Créer les spécialités DSI et RSI
    const [dsiCheck] = await pool.query(`SELECT id FROM specialites WHERE nom LIKE '%DSI%' AND id_departement = ?`, [deptInfoId]);
    if (dsiCheck.length === 0) {
      await pool.query(`
        INSERT INTO specialites (nom, id_departement, date_creation) 
        VALUES (?, ?, NOW())
      `, ['DSI - Développement de Systèmes d\'Information', deptInfoId]);
      console.log('✅ Spécialité DSI créée');
    } else {
      console.log('ℹ️ Spécialité DSI existe déjà');
    }

    const [rsiCheck] = await pool.query(`SELECT id FROM specialites WHERE nom LIKE '%RSI%' AND id_departement = ?`, [deptInfoId]);
    if (rsiCheck.length === 0) {
      await pool.query(`
        INSERT INTO specialites (nom, id_departement, date_creation) 
        VALUES (?, ?, NOW())
      `, ['RSI - Réseaux et Systèmes Informatiques', deptInfoId]);
      console.log('✅ Spécialité RSI créée');
    } else {
      console.log('ℹ️ Spécialité RSI existe déjà');
    }

    // 6. Récupérer les IDs
    const [l1Rows] = await pool.query(`SELECT id FROM niveaux WHERE code = 'L1' LIMIT 1`);
    const [l2Rows] = await pool.query(`SELECT id FROM niveaux WHERE code = 'L2' LIMIT 1`);
    const [l3Rows] = await pool.query(`SELECT id FROM niveaux WHERE code = 'L3' LIMIT 1`);
    const [dsiRows] = await pool.query(`SELECT id FROM specialites WHERE nom LIKE '%DSI%' AND id_departement = ? LIMIT 1`, [deptInfoId]);
    const [rsiRows] = await pool.query(`SELECT id FROM specialites WHERE nom LIKE '%RSI%' AND id_departement = ? LIMIT 1`, [deptInfoId]);

    if (!l1Rows[0] || !l2Rows[0] || !l3Rows[0]) {
      throw new Error('Les niveaux L1, L2, L3 n\'ont pas pu être créés ou trouvés');
    }
    if (!dsiRows[0] || !rsiRows[0]) {
      throw new Error('Les spécialités DSI ou RSI n\'ont pas pu être créées ou trouvées');
    }

    const l1Id = l1Rows[0].id;
    const l2Id = l2Rows[0].id;
    const l3Id = l3Rows[0].id;
    const dsiId = dsiRows[0].id;
    const rsiId = rsiRows[0].id;

    // 7. Créer les groupes du tranc commun (L1 - pas de spécialité)
    const groupesTrancCommun = ['TI1', 'TI2', 'TI3'];
    for (const nomGroupe of groupesTrancCommun) {
      await pool.query(`
        INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
        VALUES (?, ?, NULL, NOW())
        ON DUPLICATE KEY UPDATE nom = VALUES(nom)
      `, [nomGroupe, l1Id]);
    }
    console.log('✅ Groupes tranc commun créés: TI1, TI2, TI3');

    // 8. Créer les groupes DSI (L2)
    const groupesDSIL2 = ['DSI21', 'DSI22', 'DSI23'];
    for (const nomGroupe of groupesDSIL2) {
      await pool.query(`
        INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE nom = VALUES(nom)
      `, [nomGroupe, l2Id, dsiId]);
    }
    console.log('✅ Groupes DSI L2 créés: DSI21, DSI22, DSI23');

    // 9. Créer les groupes DSI (L3)
    const groupesDSIL3 = ['DSI31', 'DSI32'];
    for (const nomGroupe of groupesDSIL3) {
      await pool.query(`
        INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE nom = VALUES(nom)
      `, [nomGroupe, l3Id, dsiId]);
    }
    console.log('✅ Groupes DSI L3 créés: DSI31, DSI32');

    // 10. Créer les groupes RSI (L2)
    const groupesRSIL2 = ['RSI21', 'RSI22'];
    for (const nomGroupe of groupesRSIL2) {
      await pool.query(`
        INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE nom = VALUES(nom)
      `, [nomGroupe, l2Id, rsiId]);
    }
    console.log('✅ Groupes RSI L2 créés: RSI21, RSI22');

    // 11. Créer les groupes RSI (L3)
    const groupesRSIL3 = ['RSI31', 'RSI32'];
    for (const nomGroupe of groupesRSIL3) {
      await pool.query(`
        INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE nom = VALUES(nom)
      `, [nomGroupe, l3Id, rsiId]);
    }
    console.log('✅ Groupes RSI L3 créés: RSI31, RSI32');

    // 12. Vérification finale
    console.log('\n📊 Vérification de la structure créée:\n');
    const [verification] = await pool.query(`
      SELECT 
        d.nom AS departement,
        s.nom AS specialite,
        g.nom AS groupe,
        n.nom AS niveau,
        CASE WHEN g.id_specialite IS NULL THEN 'Tranc commun' ELSE 'Spécialisé' END AS type
      FROM groupes g
      LEFT JOIN specialites s ON g.id_specialite = s.id
      LEFT JOIN departements d ON s.id_departement = d.id
      LEFT JOIN niveaux n ON g.id_niveau = n.id
      WHERE d.nom LIKE '%Informatique%' OR g.nom LIKE 'TI%' OR g.nom LIKE 'DSI%' OR g.nom LIKE 'RSI%'
      ORDER BY d.nom, s.nom, n.nom, g.nom
    `);

    console.table(verification);

    console.log('\n✅ Structure ISET Tozeur initialisée avec succès!');
    console.log('\n📋 Résumé:');
    console.log('   - Département Informatique');
    console.log('   - Spécialités: DSI, RSI');
    console.log('   - Groupes L1 (tranc commun): TI1, TI2, TI3');
    console.log('   - Groupes DSI L2: DSI21, DSI22, DSI23');
    console.log('   - Groupes DSI L3: DSI31, DSI32');
    console.log('   - Groupes RSI L2: RSI21, RSI22');
    console.log('   - Groupes RSI L3: RSI31, RSI32');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// Exécuter le script
initStructure();
