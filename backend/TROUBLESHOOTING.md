# Guide de dépannage - Routes Admin

## Problème : Seul l'ajout de département fonctionne

### Vérifications à faire :

1. **Vérifier les logs du serveur**
   - Démarrez le serveur : `node server.js`
   - Essayez d'ajouter une matière/salle depuis le frontend
   - Regardez les logs dans la console du serveur
   - Vous devriez voir :
     - `🔐 verifyToken - Authorization header: Présent/Manquant`
     - `🔵 POST /api/matieres - Body: {...}`
     - `🔵 User: {...}`

2. **Vérifier le token dans le navigateur**
   - Ouvrez la console du navigateur (F12)
   - Allez dans l'onglet "Application" > "Local Storage"
   - Vérifiez que `currentUser` contient bien un `token`
   - Vérifiez que le `role` est bien `administratif` ou `admin`

3. **Vérifier les erreurs HTTP**
   - Ouvrez l'onglet "Network" dans la console du navigateur
   - Essayez d'ajouter une matière/salle
   - Regardez la requête POST
   - Vérifiez :
     - L'URL : doit être `http://localhost:3000/api/matieres` ou `/api/salles`
     - Les headers : doit contenir `Authorization: Bearer <token>`
     - La réponse : regardez le message d'erreur

4. **Erreurs courantes et solutions**

   **Erreur 401 - Token manquant**
   - Le token n'est pas envoyé dans les headers
   - Solution : Vérifiez que l'utilisateur est bien connecté
   - Vérifiez que `localStorage.getItem('currentUser')` contient un token

   **Erreur 403 - Accès non autorisé**
   - Le rôle de l'utilisateur n'est pas `administratif` ou `admin`
   - Solution : Vérifiez le rôle dans la base de données
   - Le rôle doit être exactement `administratif` (en minuscules)

   **Erreur 500 - Erreur SQL**
   - Regardez le message d'erreur dans les logs du serveur
   - Si `ER_NO_SUCH_TABLE` : la table n'existe pas
   - Si `ER_BAD_FIELD_ERROR` : une colonne n'existe pas
   - Solution : Exécutez le script `backend/sql/tables_manquantes.sql`

   **Erreur 400 - Champs requis manquants**
   - Pour matières : `nom` ET `code` sont requis
   - Pour salles : seul `nom` est requis
   - Solution : Vérifiez que tous les champs requis sont remplis

5. **Tester manuellement avec curl ou Postman**

   ```bash
   # Récupérer le token depuis localStorage du navigateur
   # Puis tester :
   
   curl -X POST http://localhost:3000/api/matieres \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
     -d '{"nom":"Test","code":"TEST","coefficient":1}'
   ```

6. **Vérifier que les routes sont bien montées**

   Dans `backend/server.js`, vous devriez avoir :
   ```javascript
   app.use('/api', referentielsRoutes);
   ```

   Cela signifie que les routes sont accessibles via :
   - `/api/departements`
   - `/api/matieres`
   - `/api/salles`
   - `/api/specialites`
   - etc.

## Commandes utiles

```bash
# Vérifier les tables
cd backend
node check-tables.js

# Démarrer le serveur avec logs détaillés
node server.js
```

## Prochaines étapes

Si le problème persiste après ces vérifications :
1. Copiez les logs du serveur
2. Copiez les erreurs de la console du navigateur
3. Vérifiez la réponse HTTP dans l'onglet Network

