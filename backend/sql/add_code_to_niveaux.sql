-- Ajouter la colonne code à la table niveaux si elle n'existe pas
ALTER TABLE `niveaux` 
ADD COLUMN `code` varchar(20) DEFAULT NULL AFTER `nom`;

-- Mettre à jour les codes pour les niveaux existants
UPDATE niveaux SET code = 'L1' WHERE nom LIKE '%Licence 1%' OR nom LIKE '%L1%';
UPDATE niveaux SET code = 'L2' WHERE nom LIKE '%Licence 2%' OR nom LIKE '%L2%';
UPDATE niveaux SET code = 'L3' WHERE nom LIKE '%Licence 3%' OR nom LIKE '%L3%';

