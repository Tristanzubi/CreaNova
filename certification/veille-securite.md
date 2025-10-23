# VULNÉRABILITÉS DE SÉCURITÉ ET VEILLE

## I. Mesures de sécurité implémentées

### A. Authentification et gestion des sessions

**Technologies utilisées** : JWT (jsonwebtoken) + argon2

**Implémentation** ([server/src/utils/auth.ts](server/src/utils/auth.ts)) :

1. **Hashage des mots de passe avec argon2**
   ```typescript
   const hash = await argon2.hash(req.body.password);
   ```
   - Argon2 est recommandé par l'OWASP pour le hashage de mots de passe
   - Plus sécurisé que bcrypt contre les attaques par force brute

2. **Tokens JWT avec expiration**
   ```typescript
   const token = jwt.sign(payload, secretKey, { expiresIn: "1d" });
   ```
   - Expiration à 1 jour pour limiter la fenêtre d'exploitation en cas de vol
   - Clé secrète stockée dans variable d'environnement (APP_SECRET)

3. **Cookies HttpOnly**
   ```typescript
   res.cookie("token", token, {
     httpOnly: true,
     secure: false, // true en production
   });
   ```
   - `httpOnly: true` empêche l'accès au cookie via JavaScript (protection XSS)
   - `secure` devrait être à `true` en production (HTTPS uniquement)

4. **Refresh token**
   - Fonction `refreshToken` qui permet de renouveler le JWT
   - Vérifie la validité du token actuel avant d'en générer un nouveau

**Protection contre** : Vol de session, attaques XSS sur les tokens, réutilisation de tokens expirés

---

### B. Protection contre les injections SQL

**Technologie** : MySQL2 avec requêtes préparées

**Implémentation** ([server/src/modules/user/userRepository.ts](server/src/modules/user/userRepository.ts)) :

```typescript
const [user] = await databaseClient.query<Rows>(
  "SELECT * FROM user_account WHERE email = ?",
  [email]
);
```

- Tous les paramètres utilisateur sont passés via des placeholders `?`
- MySQL2 échappe automatiquement les valeurs et empêche l'injection de code SQL
- Aucune concaténation de chaînes dans les requêtes

**Protection contre** : Injection SQL (OWASP Top 10 #1)

---

### C. Validation des entrées utilisateur

**Implémentation** ([server/src/utils/validation.ts](server/src/utils/validation.ts)) :

```typescript
const mailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
```

**Règles de validation** :
- **Email** : Format valide avec regex
- **Mot de passe** :
  - Minimum 8 caractères
  - Au moins une majuscule
  - Au moins une minuscule
  - Au moins un chiffre
- **Champs obligatoires** : firstname, lastname, email, password

**Protection contre** : Injections, données malformées, mots de passe faibles

---

### D. Upload sécurisé de fichiers

**Technologie** : Multer

**Implémentation** ([server/src/utils/file.ts](server/src/utils/file.ts)) :

```typescript
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 }, // 500 KB max
});
```

**Mesures de sécurité** :
1. **Validation du type MIME** : Seules les images sont acceptées
2. **Limite de taille** : 500 KB maximum par fichier
3. **Nom de fichier unique** : UUID généré avec `crypto.randomUUID()`
4. **Stockage sécurisé** : Dossier `public/` dédié

**Protection contre** : Upload de fichiers malveillants, saturation du disque, écrasement de fichiers

---

### E. Configuration CORS

**Implémentation** ([server/src/app.ts](server/src/app.ts)) :

```typescript
if (process.env.CLIENT_URL != null) {
  app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true
  }));
}
```

**Mesures de sécurité** :
- **Origine unique** : Seul CLIENT_URL est autorisé (défini dans .env)
- **Credentials activés** : Permet l'envoi de cookies entre domaines
- **Pas de wildcard** : Évite `origin: "*"` qui accepterait toutes les origines

**Protection contre** : Requêtes cross-origin non autorisées

---

### F. Variables d'environnement

**Fichier** : [server/.env.sample](server/.env.sample)

**Secrets stockés hors du code** :
- `APP_SECRET` : Clé secrète pour signer les JWT
- `DB_USER` / `DB_PASSWORD` : Credentials de base de données
- `CLIENT_URL` : URL autorisée pour CORS

**Bonnes pratiques** :
- Fichier `.env` dans `.gitignore`
- Fichier `.env.sample` comme modèle (sans valeurs sensibles)

**Protection contre** : Exposition de secrets dans le repository Git

---

## II. Veille technologique et ressources

### A. Méthodologie de recherche

Pour mes recherches techniques, j'adopte le processus suivant :

1. **Recherche en anglais** avec termes techniques précis
2. **Priorisation des sources** :
   - Documentation officielle (argon2, JWT, Multer, MySQL2)
   - Organismes de référence (OWASP, MDN)
   - Articles techniques récents (Medium, LogRocket)
   - Stack Overflow pour débats théoriques
3. **Vérification** : Date de publication et croisement des informations

### B. Sources consultées pour ce projet

**Authentification** :
- Documentation argon2 : https://www.npmjs.com/package/argon2
- OWASP Password Storage Cheat Sheet
- JWT Best Practices : https://curity.io/resources/learn/jwt-best-practices/

**Sécurité des requêtes** :
- Documentation MySQL2 (requêtes préparées)
- OWASP SQL Injection Prevention

**Upload de fichiers** :
- Documentation Multer : https://www.npmjs.com/package/multer
- OWASP File Upload Cheat Sheet

**CORS** :
- Documentation Express CORS
- MDN Web Docs : Cross-Origin Resource Sharing

---

## III. Améliorations futures identifiées

### A. Protections non implémentées (par manque de temps)

1. **Rate limiting**
   - Limiter le nombre de tentatives de connexion
   - Protection contre les attaques par force brute
   - Ressource : https://www.npmjs.com/package/express-rate-limit

2. **CSRF tokens**
   - Tokens anti-CSRF pour les formulaires sensibles
   - Protection supplémentaire même avec cookies httpOnly

3. **Validation plus stricte**
   - Sanitization des inputs HTML (librairie DOMPurify côté client)
   - Validation des données côté front ET back

4. **Audit de sécurité**
   - Utilisation régulière de `npm audit`
   - Mise à jour des dépendances vulnérables

### B. Amélioration du code existant

1. **Cookies sécurisés en production**
   - Passer `secure: true` dans les cookies JWT (ligne 45 de auth.ts)
   - Nécessite HTTPS en production

2. **SameSite cookies**
   - Ajouter l'attribut `sameSite: 'strict'` pour protection CSRF
   - Empêche l'envoi du cookie lors de requêtes cross-site

---

## IV. Conclusion

Ce projet implémente les bases de la sécurité web moderne :
- **Authentification robuste** (JWT + argon2)
- **Protection des données** (requêtes préparées, validation)
- **Upload sécurisé** (filtres MIME, limites de taille)
- **Configuration CORS stricte**

Les améliorations futures porteraient sur le rate limiting et la protection CSRF pour atteindre les standards OWASP Top 10.
