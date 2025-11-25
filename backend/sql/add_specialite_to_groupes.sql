-- Ajouter la colonne id_specialite à la table groupes
ALTER TABLE `groupes` 
ADD COLUMN `id_specialite` int(11) DEFAULT NULL AFTER `id_niveau`,
ADD KEY `idx_specialite` (`id_specialite`);

