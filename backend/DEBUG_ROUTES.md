# Debug des Routes Admin

## Problème : Seul l'ajout de département fonctionne

### Vérifications à faire :

1. **Vérifier que le serveur est démarré**
   ```bash
   cd backend
   node server.js
   ```

2. **Vérifier les logs dans la console du serveur**
   Quand vous essayez d'ajouter une matière/salle/enseignant/étudiant, vous devriez voir :
   - `🔐 verifyToken - Authorization header: Présent/Manquant`
   - `🔵 POST /api/matieres - Body: {...}`
   - `🔵 User: {...}`

3. **Vérifier dans le navigateur (F12 > Network)**
   - Ouvrez l'onglet Network
   - Essayez d'ajouter une matière
   - Regardez la requête POST vers `/api/matieres`
   - Vérifiez :
     - **Status Code** : 200, 201, 400, 401, 403, 500 ?
     - **Request Headers** : Y a-t-il `Authorization: Bearer ...` ?
     - **Request Payload** : Les données sont-elles correctes ?
     - **Response** : Quel est le message d'erreur ?

4. **Tester manuellement avec curl**

   ```bash
   # Récupérez votre token depuis localStorage du navigateur
   # Puis testez :
   
   curl -X POST http://localhost:3000/api/matieres \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
     -d '{"nom":"Test Matiere","code":"TEST","coefficient":1}'
   ```

5. **Vérifier le rôle de l'utilisateur**
   - Dans la console du navigateur : `localStorage.getItem('currentUser')`
   - Le `role` doit être exactement `administratif` (en minuscules)
   - Si c'est `Administratif` ou `ADMINISTRATIF`, ça ne fonctionnera pas

6. **Vérifier que les routes sont bien montées**
   Dans `backend/server.js`, ligne 48 :
   ```javascript
   app.use('/api', referentielsRoutes);
   ```
   Cela signifie que les routes sont accessibles via :
   - `/api/departements` ✅
   - `/api/matieres` ✅
   - `/api/salles` ✅
   - `/api/enseignants` ✅
   - `/api/etudiants` ✅

## Erreurs courantes

### Erreur 401 - Token manquant
- Le token n'est pas envoyé dans les headers
- Vérifiez que `getHeaders()` dans `api.service.ts` retourne bien le token
- Vérifiez que l'utilisateur est connecté

### Erreur 403 - Accès non autorisé
- Le rôle n'est pas `administratif` ou `admin`
- Vérifiez le rôle dans la base de données
- Vérifiez que le token contient le bon rôle

### Erreur 400 - Champs requis manquants
- Pour matières : `nom` ET `code` sont requis
- Pour salles : seul `nom` est requis
- Pour enseignants : `nom`, `prenom`, `email` sont requis
- Pour étudiants : `nom`, `prenom`, `email`, `id_groupe` sont requis

### Erreur 500 - Erreur SQL
- Regardez les logs du serveur pour voir l'erreur SQL exacte
- Vérifiez que les tables existent
- Vérifiez que les colonnes existent

## Test rapide

Pour tester si le problème vient de l'authentification, modifiez temporairement une route POST pour retirer `verifyToken` :

```javascript
// Dans backend/routes/referentiels.js
router.post('/matieres', async (req, res) => {  // Retirer verifyToken temporairement
  // ... reste du code
});
```

Si ça fonctionne sans `verifyToken`, le problème vient du token ou de l'authentification.

