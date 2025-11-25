# Changelog - Connexion complète à la base de données

## Modifications effectuées

### 1. Inscription des étudiants ✅
- **Modification** : Les étudiants de 1ère année n'ont plus besoin de spécialité
- **Détails** : 
  - Vérification automatique si l'étudiant est en 1ère année (niveau = '1', '1ère année', 'L1', etc.)
  - `id_specialite` est NULL pour les étudiants de 1ère année
  - Spécialité obligatoire pour les étudiants de 2ème année et plus
  - Récupération automatique des IDs de département et spécialité depuis la base de données

### 2. Emploi du temps ✅
- **Connecté à la base de données** : `emploi_temps`
- **Filtrage par étudiant** :
  - Selon le groupe de l'étudiant
  - Selon la spécialité (si applicable)
  - Selon le département
- **Fonctionnalités admin** :
  - Création, modification, suppression d'emplois du temps
  - Vue complète de tous les emplois du temps

### 3. Absences ✅
- **Connecté à la base de données** : `absences`
- **Fonctionnalités étudiant** :
  - Voir ses absences avec détails (matière, enseignant, date, statut)
  - Signaler une absence (statut: `en_attente`)
  - Statistiques personnelles d'absences
- **Fonctionnalités enseignant/admin** :
  - Voir toutes les absences
  - Valider/refuser une absence
  - Signaler une absence pour un étudiant

### 4. Notes ✅
- **Connecté à la base de données** : `notes`
- **Fonctionnalités étudiant** :
  - Voir ses notes avec détails (matière, coefficient, type d'évaluation)
  - Statistiques personnelles :
    - Moyenne générale
    - Statistiques par matière
    - Statistiques par type d'évaluation
    - Notes validées/non validées
- **Fonctionnalités enseignant/admin** :
  - Ajouter, modifier, supprimer des notes
  - Voir toutes les notes

### 5. Notifications ✅
- **Connecté à la base de données** : `notifications` (avec fallback dynamique)
- **Fonctionnalités** :
  - Notifications automatiques pour absences en attente
  - **Système d'alerte d'absentéisme** :
    - ⚠️ Avertissement à partir de 5 absences non justifiées
    - ⚠️ Alerte critique à partir de 7 absences non justifiées
    - 🚨 Élimination automatique à partir de 10 absences non justifiées
  - Notifications pour changements d'emploi du temps
  - Compteur de notifications non lues
- **Fonctionnalités admin** :
  - Créer des notifications personnalisées

### 6. Messages ✅
- **Connecté à la base de données** : `messages`
- **Fonctionnalités** :
  - Envoyer des messages entre utilisateurs
  - Voir les messages reçus et envoyés
  - Marquer les messages comme lus
  - Compteur de messages non lus

### 7. Rattrapages ✅
- **Connecté à la base de données** : `rattrapages`
- **Fonctionnalités étudiant** :
  - Voir les rattrapages disponibles
- **Fonctionnalités enseignant/admin** :
  - Proposer un rattrapage
  - Modifier un rattrapage
  - Filtrer par étudiant si nécessaire

### 8. Référentiels (Admin) ✅
- **CRUD complet** pour :
  - **Départements** : Créer, lire, modifier, supprimer
  - **Spécialités** : Créer, lire, modifier, supprimer
  - **Matières** : Créer, lire, modifier, supprimer
  - **Salles** : Créer, lire, modifier, supprimer
  - **Groupes** : Créer, lire
  - **Enseignants** : Lire (liste complète)
  - **Étudiants** : Lire, créer (liste complète avec détails)

### 9. Rapports (Admin) ✅
- **Nouvelle route** : `/api/rapports`
- **Fonctionnalités** :
  - Générer des rapports (absences, notes, emploi du temps)
  - Exporter en CSV : `/api/rapports/:id/csv`
  - Exporter en JSON (pour génération PDF côté client)
  - Stockage dans la table `rapports`

### 10. Événements institutionnels (Admin) ✅
- **Nouvelle route** : `/api/evenements`
- **Fonctionnalités** :
  - Créer, modifier, supprimer des événements
  - Types : public, privé, fermeture, conférence
  - Les étudiants voient seulement les événements publics et les fermetures

## Tables SQL nécessaires

Un fichier `backend/sql/tables_manquantes.sql` a été créé avec les scripts pour créer les tables suivantes si elles n'existent pas :
- `notifications`
- `messages`
- `rattrapages`
- `evenements`
- `matieres` (vérification)
- `salles` (vérification)
- `niveaux` (vérification)

## Routes API mises à jour

### Étudiant
- `GET /api/emploi-du-temps` - Emploi du temps filtré par groupe/spécialité
- `GET /api/absences` - Ses absences
- `POST /api/absences` - Signaler une absence
- `GET /api/absences/statistiques/:id_etudiant` - Statistiques d'absences
- `GET /api/notes` - Ses notes
- `GET /api/notes/statistiques` - Statistiques personnelles
- `GET /api/notifications` - Ses notifications
- `GET /api/messages` - Ses messages
- `POST /api/messages` - Envoyer un message
- `GET /api/rattrapages` - Rattrapages disponibles

### Admin
- `GET /api/emploi-du-temps` - Tous les emplois du temps
- `POST /api/emploi-du-temps` - Créer un emploi du temps
- `PUT /api/emploi-du-temps/:id` - Modifier
- `DELETE /api/emploi-du-temps/:id` - Supprimer
- `GET /api/absences` - Toutes les absences
- `PUT /api/absences/:id` - Valider/refuser une absence
- `GET /api/notes` - Toutes les notes
- `POST /api/notes` - Ajouter une note
- `PUT /api/notes/:id` - Modifier une note
- `DELETE /api/notes/:id` - Supprimer une note
- `POST /api/notifications` - Créer une notification
- `GET /api/rapports` - Liste des rapports
- `POST /api/rapports` - Générer un rapport
- `GET /api/rapports/:id/csv` - Exporter en CSV
- `GET /api/evenements` - Liste des événements
- `POST /api/evenements` - Créer un événement
- `PUT /api/evenements/:id` - Modifier
- `DELETE /api/evenements/:id` - Supprimer
- Routes CRUD complètes pour référentiels (`/api/departements`, `/api/specialites`, `/api/matieres`, `/api/salles`, etc.)

## Notes importantes

1. **Inscription** : Les étudiants de 1ère année n'ont pas de spécialité (`id_specialite = NULL`)
2. **Élimination par absentéisme** : Automatique à partir de 10 absences non justifiées (notification automatique)
3. **Filtrage intelligent** : L'emploi du temps et les absences sont automatiquement filtrés selon le département, spécialité et groupe de l'étudiant
4. **Sécurité** : Toutes les routes sont protégées par `verifyToken` et vérifient les rôles appropriés

## Prochaines étapes recommandées

1. Exécuter le script SQL `backend/sql/tables_manquantes.sql` pour créer les tables manquantes
2. Tester toutes les routes avec Postman ou un client API
3. Vérifier que les données sont correctement filtrées selon les rôles
4. Ajouter des validations supplémentaires si nécessaire

