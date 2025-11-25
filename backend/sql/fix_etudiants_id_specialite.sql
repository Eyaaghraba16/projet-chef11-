-- Modifier la colonne id_specialite pour permettre NULL (pour les étudiants de 1ère année)
ALTER TABLE `etudiants` 
MODIFY COLUMN `id_specialite` int(11) DEFAULT NULL;

