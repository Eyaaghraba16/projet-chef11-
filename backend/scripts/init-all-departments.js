/**
 * Script pour initialiser la structure complète pour tous les départements
 * - Informatique : DSI, RSI (déjà fait)
 * - Électrique : Génie Électrique, Automatique, etc.
 * - Mécanique : Génie Mécanique, Maintenance, etc.
 */

const pool = require('../db');

async function initAllDepartments() {
  try {
    console.log('🚀 Initialisation de la structure pour tous les départements...\n');

    // Récupérer les IDs des départements
    const [deptInfo] = await pool.query(`SELECT id FROM departements WHERE LOWER(nom) LIKE '%informatique%' LIMIT 1`);
    const [deptElec] = await pool.query(`SELECT id FROM departements WHERE LOWER(nom) LIKE '%électrique%' LIMIT 1`);
    const [deptMeca] = await pool.query(`SELECT id FROM departements WHERE LOWER(nom) LIKE '%mécanique%' LIMIT 1`);

    if (!deptInfo[0] || !deptElec[0] || !deptMeca[0]) {
      throw new Error('Tous les départements doivent exister');
    }

    const deptInfoId = deptInfo[0].id;
    const deptElecId = deptElec[0].id;
    const deptMecaId = deptMeca[0].id;

    // Récupérer les IDs des niveaux
    const [l1Rows] = await pool.query(`SELECT id FROM niveaux WHERE code = 'L1' LIMIT 1`);
    const [l2Rows] = await pool.query(`SELECT id FROM niveaux WHERE code = 'L2' LIMIT 1`);
    const [l3Rows] = await pool.query(`SELECT id FROM niveaux WHERE code = 'L3' LIMIT 1`);

    const l1Id = l1Rows[0].id;
    const l2Id = l2Rows[0].id;
    const l3Id = l3Rows[0].id;

    // ============================================
    // DÉPARTEMENT ÉLECTRIQUE
    // ============================================
    console.log('📡 Initialisation du département Électrique...');

    // Supprimer les anciennes spécialités génériques
    await pool.query(`DELETE FROM specialites WHERE id_departement = ? AND (nom = 'Électrique' OR nom LIKE '%Électrique%')`, [deptElecId]);

    // Créer les spécialités pour Électrique
    const specialitesElec = [
      'GE - Génie Électrique',
      'AUT - Automatique',
      'EE - Électronique et Électrotechnique'
    ];

    const specialitesElecIds = [];
    for (const nomSpec of specialitesElec) {
      const [check] = await pool.query(`SELECT id FROM specialites WHERE nom = ? AND id_departement = ?`, [nomSpec, deptElecId]);
      if (check.length === 0) {
        const [result] = await pool.query(`INSERT INTO specialites (nom, id_departement, date_creation) VALUES (?, ?, NOW())`, [nomSpec, deptElecId]);
        specialitesElecIds.push(result.insertId);
        console.log(`  ✅ Spécialité créée: ${nomSpec}`);
      } else {
        specialitesElecIds.push(check[0].id);
        console.log(`  ℹ️ Spécialité existe déjà: ${nomSpec}`);
      }
    }

    // Créer les groupes pour Électrique
    // Tranc commun L1
    const groupesElecL1 = ['EL1', 'EL2', 'EL3'];
    for (const nomGroupe of groupesElecL1) {
      await pool.query(`INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) VALUES (?, ?, NULL, NOW()) ON DUPLICATE KEY UPDATE nom = VALUES(nom)`, [nomGroupe, l1Id]);
    }
    console.log(`  ✅ Groupes L1 créés: ${groupesElecL1.join(', ')}`);

    // Groupes par spécialité L2 et L3
    const groupesParSpec = {
      'GE - Génie Électrique': { l2: ['GE21', 'GE22'], l3: ['GE31', 'GE32'] },
      'AUT - Automatique': { l2: ['AUT21', 'AUT22'], l3: ['AUT31', 'AUT32'] },
      'EE - Électronique et Électrotechnique': { l2: ['EE21', 'EE22'], l3: ['EE31', 'EE32'] }
    };

    for (let i = 0; i < specialitesElec.length; i++) {
      const nomSpec = specialitesElec[i];
      const specId = specialitesElecIds[i];
      const groupes = groupesParSpec[nomSpec];

      for (const nomGroupe of groupes.l2) {
        await pool.query(`INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE nom = VALUES(nom)`, [nomGroupe, l2Id, specId]);
      }
      for (const nomGroupe of groupes.l3) {
        await pool.query(`INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE nom = VALUES(nom)`, [nomGroupe, l3Id, specId]);
      }
      console.log(`  ✅ Groupes créés pour ${nomSpec}: ${groupes.l2.join(', ')}, ${groupes.l3.join(', ')}`);
    }

    // ============================================
    // DÉPARTEMENT MÉCANIQUE
    // ============================================
    console.log('\n🔧 Initialisation du département Mécanique...');

    // Supprimer les anciennes spécialités génériques
    await pool.query(`DELETE FROM specialites WHERE id_departement = ? AND (nom = 'Mécanique' OR nom LIKE '%Mécanique%')`, [deptMecaId]);

    // Créer les spécialités pour Mécanique
    const specialitesMeca = [
      'GM - Génie Mécanique',
      'MAINT - Maintenance Industrielle',
      'PROD - Production Mécanique'
    ];

    const specialitesMecaIds = [];
    for (const nomSpec of specialitesMeca) {
      const [check] = await pool.query(`SELECT id FROM specialites WHERE nom = ? AND id_departement = ?`, [nomSpec, deptMecaId]);
      if (check.length === 0) {
        const [result] = await pool.query(`INSERT INTO specialites (nom, id_departement, date_creation) VALUES (?, ?, NOW())`, [nomSpec, deptMecaId]);
        specialitesMecaIds.push(result.insertId);
        console.log(`  ✅ Spécialité créée: ${nomSpec}`);
      } else {
        specialitesMecaIds.push(check[0].id);
        console.log(`  ℹ️ Spécialité existe déjà: ${nomSpec}`);
      }
    }

    // Créer les groupes pour Mécanique
    // Tranc commun L1
    const groupesMecaL1 = ['MEC1', 'MEC2', 'MEC3'];
    for (const nomGroupe of groupesMecaL1) {
      await pool.query(`INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) VALUES (?, ?, NULL, NOW()) ON DUPLICATE KEY UPDATE nom = VALUES(nom)`, [nomGroupe, l1Id]);
    }
    console.log(`  ✅ Groupes L1 créés: ${groupesMecaL1.join(', ')}`);

    // Groupes par spécialité L2 et L3
    const groupesMecaParSpec = {
      'GM - Génie Mécanique': { l2: ['GM21', 'GM22'], l3: ['GM31', 'GM32'] },
      'MAINT - Maintenance Industrielle': { l2: ['MAINT21', 'MAINT22'], l3: ['MAINT31', 'MAINT32'] },
      'PROD - Production Mécanique': { l2: ['PROD21', 'PROD22'], l3: ['PROD31', 'PROD32'] }
    };

    for (let i = 0; i < specialitesMeca.length; i++) {
      const nomSpec = specialitesMeca[i];
      const specId = specialitesMecaIds[i];
      const groupes = groupesMecaParSpec[nomSpec];

      for (const nomGroupe of groupes.l2) {
        await pool.query(`INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE nom = VALUES(nom)`, [nomGroupe, l2Id, specId]);
      }
      for (const nomGroupe of groupes.l3) {
        await pool.query(`INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE nom = VALUES(nom)`, [nomGroupe, l3Id, specId]);
      }
      console.log(`  ✅ Groupes créés pour ${nomSpec}: ${groupes.l2.join(', ')}, ${groupes.l3.join(', ')}`);
    }

    // Vérification finale
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
      ORDER BY d.nom, s.nom, n.nom, g.nom
    `);

    console.table(verification);

    console.log('\n✅ Structure complète initialisée avec succès!');
    console.log('\n📋 Résumé:');
    console.log('   - Département Informatique: DSI, RSI');
    console.log('   - Département Électrique: GE, AUT, EE');
    console.log('   - Département Mécanique: GM, MAINT, PROD');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// Exécuter le script
initAllDepartments();

