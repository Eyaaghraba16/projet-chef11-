-- Table rapports pour la plateforme de gestion universitaire
-- À exécuter dans la base `gestion_universitaire`

CREATE TABLE IF NOT EXISTS `rapports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titre` varchar(200) NOT NULL,
  `type` enum('absences','notes','emploi_du_temps','evenements','autre') DEFAULT 'autre',
  `periode` varchar(50) DEFAULT NULL,
  `resume` text DEFAULT NULL,
  `contenu` longtext DEFAULT NULL,
  `date_generation` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `rapports` (`titre`, `type`, `periode`, `resume`, `contenu`)
VALUES
  ('Synthèse des absences - Novembre', 'absences', '2025-11', 'Résumé des absences étudiantes pour novembre 2025.', 'Données détaillées absences...'),
  ('Performance académique L1 Info', 'notes', '2025-10/2025-11', 'Moyennes et statistiques des étudiants L1 Informatique.', 'Données détaillées notes...');

