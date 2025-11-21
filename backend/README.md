# Backend - Plateforme de Gestion Universitaire

## Installation

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

Le serveur démarre sur `http://localhost:3000`

## Structure du projet

```
backend/
├── server.js              # Point d'entrée du serveur
├── package.json           # Dépendances
├── middleware/
│   └── auth.js           # Middleware d'authentification JWT
└── routes/
    ├── auth.js           # Routes d'authentification
    ├── emploi.js         # Routes emploi du temps
    ├── absences.js       # Routes absences
    ├── notes.js          # Routes notes
    ├── notifications.js  # Routes notifications
    ├── rattrapages.js    # Routes rattrapages
    ├── messages.js       # Routes messagerie
    └── referentiels.js   # Routes référentiels (départements, salles, etc.)
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Emploi du temps
- `GET /api/emploi-du-temps` - Récupérer l'emploi du temps
- `POST /api/emploi-du-temps` - Créer un cours

### Absences
- `GET /api/absences` - Récupérer les absences
- `POST /api/absences` - Signaler une absence
- `PUT /api/absences/:id` - Valider/refuser une absence

### Notes
- `GET /api/notes` - Récupérer les notes

### Notifications
- `GET /api/notifications` - Récupérer les notifications

### Rattrapages
- `GET /api/rattrapages` - Récupérer les rattrapages
- `POST /api/rattrapages` - Proposer un rattrapage

### Messages
- `GET /api/messages` - Récupérer les messages
- `POST /api/messages` - Envoyer un message

### Référentiels
- `GET /api/departements` - Récupérer les départements
- `GET /api/matieres` - Récupérer les matières
- `GET /api/salles` - Récupérer les salles

## Note

Ce backend utilise des données en mémoire pour simplifier le code. Dans une application réelle, vous devez connecter une vraie base de données.
