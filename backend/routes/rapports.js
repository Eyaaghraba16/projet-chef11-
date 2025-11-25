const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../db');

// GET - Récupérer tous les rapports (admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const [rapports] = await pool.query(`
      SELECT * FROM rapports 
      ORDER BY date_generation DESC
    `);

    res.json(rapports);
  } catch (error) {
    console.error('❌ Erreur GET /rapports:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rapports' });
  }
});

// POST - Générer un rapport (admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { titre, type, periode, resume } = req.body;

    if (!titre || !type) {
      return res.status(400).json({ message: 'Titre et type sont requis' });
    }

    let contenu = '';

    // Générer le contenu selon le type
    if (type === 'absences') {
      const [absences] = await pool.query(`
        SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN statut = 'non_justifie' THEN 1 ELSE 0 END) AS non_justifiees,
          SUM(CASE WHEN statut = 'justifie' THEN 1 ELSE 0 END) AS justifiees,
          CONCAT(u.nom, ' ', u.prenom) AS etudiant,
          e.id AS id_etudiant
        FROM absences a
        INNER JOIN etudiants e ON a.id_etudiant = e.id
        INNER JOIN utilisateurs u ON e.id_utilisateur = u.id
        WHERE DATE_FORMAT(a.date_absence, '%Y-%m') = ?
        GROUP BY e.id, u.nom, u.prenom
      `, [periode || new Date().toISOString().substring(0, 7)]);

      contenu = JSON.stringify(absences, null, 2);
    } else if (type === 'notes') {
      const [notes] = await pool.query(`
        SELECT 
          m.nom AS matiere,
          AVG(n.note) AS moyenne,
          COUNT(n.id) AS nombre_notes,
          MIN(n.note) AS note_min,
          MAX(n.note) AS note_max
        FROM notes n
        INNER JOIN matieres m ON n.id_matiere = m.id
        WHERE DATE_FORMAT(n.date_evaluation, '%Y-%m') = ?
        GROUP BY m.id, m.nom
      `, [periode || new Date().toISOString().substring(0, 7)]);

      contenu = JSON.stringify(notes, null, 2);
    } else if (type === 'emploi_du_temps') {
      const [emploi] = await pool.query(`
        SELECT 
          COUNT(*) AS total_cours,
          SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END) AS annules,
          SUM(CASE WHEN statut = 'reporte' THEN 1 ELSE 0 END) AS reportes,
          m.nom AS matiere
        FROM emploi_temps et
        INNER JOIN matieres m ON et.id_matiere = m.id
        WHERE DATE_FORMAT(et.date, '%Y-%m') = ?
        GROUP BY m.id, m.nom
      `, [periode || new Date().toISOString().substring(0, 7)]);

      contenu = JSON.stringify(emploi, null, 2);
    }

    const [result] = await pool.query(
      `INSERT INTO rapports (titre, type, periode, resume, contenu, date_generation)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [titre, type, periode || null, resume || null, contenu]
    );

    res.status(201).json({ message: 'Rapport généré', id: result.insertId, contenu });
  } catch (error) {
    console.error('❌ Erreur POST /rapports:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du rapport' });
  }
});

// GET - Exporter un rapport en CSV
router.get('/:id/csv', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const [rapports] = await pool.query('SELECT * FROM rapports WHERE id = ?', [id]);

    if (rapports.length === 0) {
      return res.status(404).json({ message: 'Rapport non trouvé' });
    }

    const rapport = rapports[0];
    const data = JSON.parse(rapport.contenu || '[]');

    // Convertir en CSV
    if (data.length === 0) {
      return res.status(400).json({ message: 'Aucune donnée à exporter' });
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="rapport_${rapport.type}_${rapport.periode || 'all'}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Erreur GET /rapports/:id/csv:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export CSV' });
  }
});

// GET - Exporter un rapport en JSON (pour PDF côté client)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'administratif' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const [rapports] = await pool.query('SELECT * FROM rapports WHERE id = ?', [id]);

    if (rapports.length === 0) {
      return res.status(404).json({ message: 'Rapport non trouvé' });
    }

    const rapport = rapports[0];
    rapport.contenu = JSON.parse(rapport.contenu || '[]');

    res.json(rapport);
  } catch (error) {
    console.error('❌ Erreur GET /rapports/:id:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du rapport' });
  }
});

module.exports = router;

