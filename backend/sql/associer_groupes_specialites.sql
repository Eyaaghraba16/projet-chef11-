-- Script pour associer les groupes aux spécialités
-- IMPORTANT: Exécutez ce script pour que le filtrage des groupes par spécialité fonctionne correctement

-- 1. Voir l'état actuel des groupes et spécialités
SELECT 
  g.id AS groupe_id, 
  g.nom AS groupe_nom, 
  g.id_specialite,
  s.id AS specialite_id,
  s.nom AS specialite_nom,
  s.id_departement
FROM groupes g 
LEFT JOIN specialites s ON g.id_specialite = s.id
ORDER BY g.id;

-- 2. Voir toutes les spécialités disponibles
SELECT id, nom, id_departement FROM specialites ORDER BY id;

-- 3. Associer manuellement les groupes aux spécialités
-- Exemple : Associer le groupe ID 1 à la spécialité ID 1
-- UPDATE groupes SET id_specialite = 1 WHERE id = 1;

-- Exemple : Associer tous les groupes d'un niveau à une spécialité
-- UPDATE groupes SET id_specialite = 1 WHERE id_niveau = 1;

-- 4. Pour associer automatiquement selon le nom du groupe (si les noms contiennent DSI, TI, etc.)
-- UPDATE groupes SET id_specialite = (
--   SELECT id FROM specialites 
--   WHERE nom LIKE '%Développement%' OR nom LIKE '%DSI%' 
--   LIMIT 1
-- ) WHERE nom LIKE '%DSI%';

-- UPDATE groupes SET id_specialite = (
--   SELECT id FROM specialites 
--   WHERE nom LIKE '%Technologie%' OR nom LIKE '%TI%' 
--   LIMIT 1
-- ) WHERE nom LIKE '%TI%';

-- 5. Vérifier les associations après modification
-- SELECT g.id, g.nom AS groupe, s.nom AS specialite 
-- FROM groupes g 
-- LEFT JOIN specialites s ON g.id_specialite = s.id;
