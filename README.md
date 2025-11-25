# Plateforme de Gestion Universitaire

Application complète avec Angular (frontend) et Node.js (backend).

## Structure du projet

```
project/
├── src/                   # Frontend Angular
│   ├── app/
│   │   ├── components/   # Composants UI
│   │   ├── services/     # Services Angular
│   │   └── models/       # Modèles de données
│   └── ...
└── backend/              # Backend Node.js
    ├── routes/           # Routes API
    ├── middleware/       # Middleware
    └── server.js        # Serveur Express
```

## Installation et démarrage

### Frontend (Angular)

1. Installer les dépendances:
```bash
npm install
```

2. Démarrer le serveur de développement:
```bash
npm start
```

Le frontend sera accessible sur `http://localhost:4200`

### Backend (Node.js)

1. Aller dans le dossier backend:
```bash
cd backend
```

2. Installer les dépendances:
```bash
npm install
```

3. Démarrer le serveur:
```bash
npm start
```

Le backend sera accessible sur `http://localhost:3000`

## Comptes de test

Pour tester l'application, vous devez d'abord créer un compte via la page d'inscription.

Rôles disponibles:
- Étudiant
- Enseignant
- Directeur de département
- Personnel administratif

## Fonctionnalités

### Étudiant
- Consulter l'emploi du temps
- Voir les absences
- Consulter les notes
- Recevoir des notifications
- Utiliser la messagerie

### Enseignant
- Consulter l'emploi du temps
- Signaler des absences
- Valider les absences étudiants
- Proposer des rattrapages
- Utiliser la messagerie

### Directeur
- Gérer les emplois du temps
- Tableau de bord
- Gérer les absences et rattrapages
- Gérer les matières

### Administratif
- Gérer les référentiels (départements, salles, matières)
- Superviser les emplois du temps
- Générer des rapports
- Gérer les événements

## Technologies utilisées

### Frontend
- Angular 20
- TypeScript
- RxJS
- Angular Router
- HttpClient

### Backend
- Node.js
- Express
- JWT (authentification)
- bcryptjs (hashage de mots de passe)
- CORS
