-- Tables manquantes pour la plateforme de gestion universitaire
-- À exécuter dans la base `gestion_universitaire`

-- Table notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titre` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','alerte','avertissement','alerte_critique','elimination','absence','emploi_temps') DEFAULT 'info',
  `id_utilisateur` int(11) DEFAULT NULL,
  `lu` tinyint(1) DEFAULT 0,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_utilisateur` (`id_utilisateur`),
  KEY `idx_lu` (`lu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_expediteur` int(11) NOT NULL,
  `id_destinataire` int(11) NOT NULL,
  `sujet` varchar(200) NOT NULL,
  `contenu` text NOT NULL,
  `lu` tinyint(1) DEFAULT 0,
  `date_envoi` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_expediteur` (`id_expediteur`),
  KEY `idx_destinataire` (`id_destinataire`),
  KEY `idx_lu` (`lu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table rattrapages
CREATE TABLE IF NOT EXISTS `rattrapages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_matiere` int(11) NOT NULL,
  `id_salle` int(11) DEFAULT NULL,
  `id_enseignant` int(11) NOT NULL,
  `id_etudiant` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `statut` enum('planifie','confirme','annule','termine') DEFAULT 'planifie',
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_matiere` (`id_matiere`),
  KEY `idx_enseignant` (`id_enseignant`),
  KEY `idx_etudiant` (`id_etudiant`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table absences enseignants
CREATE TABLE IF NOT EXISTS `absences_enseignants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_enseignant` int(11) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `heure_debut` time DEFAULT NULL,
  `heure_fin` time DEFAULT NULL,
  `motif` text NOT NULL,
  `statut` enum('en_attente','approuve','refuse','annule') DEFAULT 'en_attente',
  `commentaire` text DEFAULT NULL,
  `duree_heures` decimal(6,2) DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_mise_a_jour` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_enseignant_abs` (`id_enseignant`),
  CONSTRAINT `fk_abs_enseignant` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table evenements
CREATE TABLE IF NOT EXISTS `evenements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titre` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('public','prive','fermeture','conference','autre') DEFAULT 'public',
  `date_debut` datetime NOT NULL,
  `date_fin` datetime DEFAULT NULL,
  `lieu` varchar(200) DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_date_debut` (`date_debut`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Vérifier que la table matieres existe avec les colonnes nécessaires
-- Si elle n'existe pas, la créer
CREATE TABLE IF NOT EXISTS `matieres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(200) NOT NULL,
  `code` varchar(50) NOT NULL,
  `coefficient` decimal(3,2) DEFAULT 1.00,
  `id_departement` int(11) DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_departement` (`id_departement`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Vérifier que la table salles existe
CREATE TABLE IF NOT EXISTS `salles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `capacite` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Vérifier que la table niveaux existe (pour les groupes)
CREATE TABLE IF NOT EXISTS `niveaux` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_CI;

