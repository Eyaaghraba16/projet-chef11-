-- Script d'initialisation de la structure ISET Tozeur
-- Ce script crée les spécialités DSI et RSI pour le département Informatique
-- et les groupes correspondants (DSI21-23, DSI31-32, RSI21-22, RSI31-32, TI1-3)

-- ============================================
-- 1. AJOUTER LA COLONNE CODE SI NÉCESSAIRE
-- ============================================
-- Ajouter la colonne code si elle n'existe pas
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'niveaux' 
  AND COLUMN_NAME = 'code');
  
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE niveaux ADD COLUMN code varchar(20) DEFAULT NULL AFTER nom', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. CRÉER LES NIVEAUX (si nécessaire)
-- ============================================
INSERT IGNORE INTO niveaux (nom, code) VALUES 
('Licence 1', 'L1'),
('Licence 2', 'L2'),
('Licence 3', 'L3');

-- Mettre à jour les codes pour les niveaux existants
UPDATE niveaux SET code = 'L1' WHERE (nom LIKE '%Licence 1%' OR nom LIKE '%L1%') AND (code IS NULL OR code = '');
UPDATE niveaux SET code = 'L2' WHERE (nom LIKE '%Licence 2%' OR nom LIKE '%L2%') AND (code IS NULL OR code = '');
UPDATE niveaux SET code = 'L3' WHERE (nom LIKE '%Licence 3%' OR nom LIKE '%L3%') AND (code IS NULL OR code = '');

-- ============================================
-- 2. CRÉER LES SPÉCIALITÉS POUR LE DÉPARTEMENT INFORMATIQUE
-- ============================================
-- Supprimer les anciennes spécialités "Informatique" génériques du département Informatique
DELETE FROM specialites 
WHERE id_departement = (SELECT id FROM departements WHERE LOWER(nom) LIKE '%informatique%' LIMIT 1) 
AND (nom = 'Informatique' OR nom LIKE '%Informatique%');

-- Créer les spécialités DSI et RSI
INSERT INTO specialites (nom, id_departement, date_creation) 
SELECT 
  'DSI - Développement de Systèmes d''Information',
  (SELECT id FROM departements WHERE LOWER(nom) LIKE '%informatique%' LIMIT 1),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM specialites 
  WHERE nom LIKE '%DSI%' 
  AND id_departement = (SELECT id FROM departements WHERE LOWER(nom) LIKE '%informatique%' LIMIT 1)
);

INSERT INTO specialites (nom, id_departement, date_creation) 
SELECT 
  'RSI - Réseaux et Systèmes Informatiques',
  (SELECT id FROM departements WHERE LOWER(nom) LIKE '%informatique%' LIMIT 1),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM specialites 
  WHERE nom LIKE '%RSI%' 
  AND id_departement = (SELECT id FROM departements WHERE LOWER(nom) LIKE '%informatique%' LIMIT 1)
);

-- ============================================
-- 3. CRÉER LES GROUPES
-- ============================================

-- Créer les groupes du tranc commun (L1 - pas de spécialité)
INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'TI1', id, NULL, NOW() FROM niveaux WHERE code = 'L1' LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'TI2', id, NULL, NOW() FROM niveaux WHERE code = 'L1' LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'TI3', id, NULL, NOW() FROM niveaux WHERE code = 'L1' LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

-- Créer les groupes DSI (L2)
INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'DSI21', n.id, s.id, NOW() 
FROM niveaux n, specialites s 
WHERE n.code = 'L2' AND s.nom LIKE '%DSI%' 
LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'DSI22', n.id, s.id, NOW() 
FROM niveaux n, specialites s 
WHERE n.code = 'L2' AND s.nom LIKE '%DSI%' 
LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'DSI23', n.id, s.id, NOW() 
FROM niveaux n, specialites s 
WHERE n.code = 'L2' AND s.nom LIKE '%DSI%' 
LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

-- Créer les groupes DSI (L3)
INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'DSI31', n.id, s.id, NOW() 
FROM niveaux n, specialites s 
WHERE n.code = 'L3' AND s.nom LIKE '%DSI%' 
LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'DSI32', n.id, s.id, NOW() 
FROM niveaux n, specialites s 
WHERE n.code = 'L3' AND s.nom LIKE '%DSI%' 
LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

-- Créer les groupes RSI (L2)
INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'RSI21', n.id, s.id, NOW() 
FROM niveaux n, specialites s 
WHERE n.code = 'L2' AND s.nom LIKE '%RSI%' 
LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'RSI22', n.id, s.id, NOW() 
FROM niveaux n, specialites s 
WHERE n.code = 'L2' AND s.nom LIKE '%RSI%' 
LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

-- Créer les groupes RSI (L3)
INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'RSI31', n.id, s.id, NOW() 
FROM niveaux n, specialites s 
WHERE n.code = 'L3' AND s.nom LIKE '%RSI%' 
LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO groupes (nom, id_niveau, id_specialite, date_creation) 
SELECT 'RSI32', n.id, s.id, NOW() 
FROM niveaux n, specialites s 
WHERE n.code = 'L3' AND s.nom LIKE '%RSI%' 
LIMIT 1
ON DUPLICATE KEY UPDATE nom = VALUES(nom);
