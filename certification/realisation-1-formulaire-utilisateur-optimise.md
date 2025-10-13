# RÉALISATION 1 : FORMULAIRE DE DONNÉES PERSONNELLES

---

## 🎯 VUE D'ENSEMBLE

### CONTEXTE & OBJECTIF
Développement d'une fonctionnalité permettant aux utilisateurs connectés de modifier leurs informations personnelles (nom, prénom, email, adresse, description).

**Route front-end :** `/user-form`
**API :** GET `/api/user/:id` + PUT `/api/user/:id`

### 🔄 FLUX TECHNIQUE
1. Chargement de `/user-form` → Requête GET `/api/user/:id` avec JWT
2. Récupération des données → Pré-remplissage du formulaire
3. Utilisateur modifie les champs → Soumission du formulaire
4. Requête PUT `/api/user/:id` avec FormData → UPDATE MySQL
5. Confirmation affichée à l'utilisateur (toast)

### 💻 TECHNOLOGIES

| Front-end | Back-end |
|-----------|----------|
| React 19 + TypeScript | Express + TypeScript |
| React Router v7 | MySQL2 |
| React-Toastify | Architecture MVC |
| Custom Hook (useAuth) | - |

### 🎨 ARCHITECTURE
**Front :** `client/src/pages/UserFormPage/UserFormPage.tsx` (~180 lignes)
**Back :** `server/src/modules/user/userActions.ts` + `server/src/router.ts`
**Pattern :** Architecture MVC avec séparation Actions / Repository

---

## 💻 CODE FRONT-END

### 📸 CAPTURE 1 : État initial

**Fichier :** `client/src/pages/UserFormPage/UserFormPage.tsx` (lignes 8-12)

```typescript
function UserFormPage() {
  const { user, isLogged } = useAuth();
  const [userData, setUserData] = useState<UserFormData | null>(null);
  const [previewImage, setPreviewImage] = useState<string>();
```

**💡 Explication :**
- État : `userData` (données BDD) + `previewImage` (aperçu image)
- Hook personnalisé `useAuth()` pour récupérer l'utilisateur connecté
- Typage TypeScript strict avec l'interface `UserFormData`

**→ Voir Annexe - Capture 1**

---

### 📸 CAPTURE 2 : Récupération et pré-remplissage

**Fichier :** `client/src/pages/UserFormPage/UserFormPage.tsx` (lignes 14-31)

```typescript
useEffect(() => {
  if (!user) return;
  fetch(`http://localhost:3310/api/user/${user.id}`, {
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) throw new Error("Erreur lors de la récupération");
      return response.json();
    })
    .then((data) => {
      setUserData(data);
    })
    .catch((error) => {
      console.error(error);
      toast.error("Impossible de récupérer les données utilisateur");
    });
}, [user]);
```

**💡 Explication :**
- Hook `useEffect` exécuté au montage du composant
- Appel API GET avec `credentials: "include"` pour envoyer le JWT
- Assignation directe des données dans l'état
- Gestion d'erreur avec toast

**→ Voir Annexe - Captures 2a et 2b**

---

### 📸 CAPTURE 3 : Validation upload d'image

**Fichier :** `client/src/pages/UserFormPage/UserFormPage.tsx` (lignes 33-44)

```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    if (file.size > 500 * 1024) {
      toast.error("La taille de l'image ne doit pas être supérieur à 500ko");
      e.target.value = "";
      setPreviewImage(undefined);
      return;
    }
    setPreviewImage(URL.createObjectURL(file));
  }
};
```

**💡 Explication :**
- Validation côté client : taille max 500ko
- `URL.createObjectURL()` pour prévisualisation instantanée
- Gestion d'erreur avec toast et réinitialisation du champ

**→ Voir Annexe - Capture 3**

---

### 📸 CAPTURE 4 : Soumission du formulaire

**Fichier :** `client/src/pages/UserFormPage/UserFormPage.tsx` (lignes 46-68)

```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!user) return;

  const data = new FormData(e.currentTarget);

  fetch(`http://localhost:3310/api/user/${user.id}`, {
    method: "PUT",
    credentials: "include",
    body: data,
  })
    .then((response) => {
      if (response.ok) {
        toast.success("Informations mises à jour avec succès !");
      } else {
        throw new Error("Erreur lors de la mise à jour");
      }
    })
    .catch((error) => {
      console.error(error);
      toast.error("Impossible de mettre à jour les données");
    });
};
```

**💡 Explication :**
- `new FormData(e.currentTarget)` récupère automatiquement toutes les valeurs du formulaire
- Requête PUT avec JWT (cookies)
- Feedback immédiat via toasts (succès/erreur)

**→ Voir Annexe - Captures 4a, 4b et 4c**

---

### 📸 CAPTURE 5 : Formulaire HTML

**Fichier :** `client/src/pages/UserFormPage/UserFormPage.tsx` (lignes 101-183)

```typescript
<form onSubmit={handleSubmit}>
  <h2>Mes informations personnelles</h2>

  <label htmlFor="lastname">Nom</label>
  <input
    type="text"
    name="lastname"
    defaultValue={userData.lastname}
  />

  <label htmlFor="firstname">Prénom</label>
  <input
    type="text"
    name="firstname"
    defaultValue={userData.firstname}
  />

  <label htmlFor="email">Email</label>
  <input
    type="email"
    name="email"
    defaultValue={userData.email}
  />

  {/* Autres champs : street, city, zip_code, country, description */}

  <button type="submit">Valider</button>
</form>
```

**💡 Explication :**
- `defaultValue` pour pré-remplir les champs
- Attribut `name` sur chaque input permet à FormData de récupérer les valeurs automatiquement
- Formulaire non contrôlé

**→ Voir Annexe - Capture 5**

---

## 🔧 CODE BACK-END

### 📸 CAPTURE 6 : Routes API

**Fichier :** `server/src/router.ts` (lignes 80-86)

```typescript
router.get("/api/user/:id", userActions.getUserById);
router.put("/api/user/:id", userActions.editUser);
```

**💡 Explication :**
- Route GET : récupération des données utilisateur par ID
- Route PUT : mise à jour des données utilisateur
- Architecture modulaire avec contrôleurs séparés

**→ Voir Annexe - Capture 6**

---

### 📸 CAPTURE 7 : Contrôleur - Récupération

**Fichier :** `server/src/modules/user/userActions.ts` (lignes 66-83)

```typescript
const getUserById: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      res.status(400).json("Invalid user ID");
      return;
    }

    const user = await userRepository.readById(userId);
    if (!user) {
      res.status(404).json("User not found");
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
```

**💡 Explication :**
- Validation de l'ID (conversion en nombre)
- Appel au repository pour lecture en base de données
- Gestion des codes HTTP appropriés (400, 404, 200)
- Try/catch pour propagation des erreurs au middleware global

**→ Voir Annexe - Capture 7**

---

### 📸 CAPTURE 8 : Contrôleur - Mise à jour

**Fichier :** `server/src/modules/user/userActions.ts` (lignes 47-65)

```typescript
const editUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      res.status(400).json("Invalid user ID");
      return;
    }

    const affectedRows = await userRepository.updateId(userId, req.body);

    if (affectedRows === 0) {
      res.status(404).json("User not found");
      return;
    }
    res.status(200).json("User updated successfully");
  } catch (err) {
    next(err);
  }
};
```

**💡 Explication :**
- Validation des paramètres d'URL
- Appel au repository pour UPDATE MySQL
- Vérification de l'existence de l'utilisateur (`affectedRows`)
- Réponse claire pour le front-end

**→ Voir Annexe - Capture 8**

---

## 🚀 COMPÉTENCES DÉMONTRÉES

### Front-end
✅ **React Hooks** : `useState`, `useEffect`, hook personnalisé `useAuth`
✅ **TypeScript** : Interfaces personnalisées, typage strict, null safety
✅ **Gestion de formulaires** : Utilisation de `defaultValue` et FormData natif
✅ **Communication API** : Fetch (GET/PUT) avec credentials, gestion async/await
✅ **UX/UI** : Toasts de feedback, prévisualisation d'image, protection de route

### Back-end
✅ **Architecture MVC** : Séparation Controller (Actions) / Model (Repository)
✅ **API RESTful** : Routes paramétrées (`:id`), méthodes HTTP appropriées (GET, PUT)
✅ **Validation** : Vérification des paramètres, codes HTTP explicites
✅ **Base de données** : Requêtes MySQL (SELECT, UPDATE) avec async/await
✅ **Gestion d'erreurs** : Try/catch, propagation au middleware global

---

---

## 📎 ANNEXE - CAPTURES D'ÉCRAN

### Capture 1 : État initial du composant
Screenshot du code VSCode montrant la déclaration de l'état (lignes 8-12)

### Capture 2a : Code useEffect
Screenshot du code de récupération des données (lignes 14-31)

### Capture 2b : Requête GET réussie
Screenshot DevTools → Onglet Network → Requête GET `/api/user/:id` avec status 200

### Capture 3 : Interface avec prévisualisation d'image
Screenshot de l'interface utilisateur montrant la prévisualisation de l'image sélectionnée

### Capture 4a : Code handleSubmit
Screenshot du code de soumission du formulaire (lignes 46-68)

### Capture 4b : Requête PUT dans DevTools
Screenshot DevTools → Onglet Network → Requête PUT avec FormData visible dans le payload

### Capture 4c : Toast de confirmation
Screenshot du toast de succès "Informations mises à jour avec succès !"

### Capture 5 : Code du formulaire avec defaultValue
Screenshot du code montrant l'utilisation de defaultValue pour pré-remplir les champs

### Capture 6 : Routes API
Screenshot du fichier `router.ts` montrant les routes GET et PUT (lignes 80-86)

### Capture 7 : Contrôleur getUserById
Screenshot du fichier `userActions.ts` montrant la fonction `getUserById` (lignes 66-83)

### Capture 8 : Contrôleur editUser
Screenshot du fichier `userActions.ts` montrant la fonction `editUser` (lignes 47-65)

---

## ✅ RÉSULTAT FINAL

### Fonctionnalités implémentées
✅ Récupération automatique des données au chargement de la page
✅ Formulaire pré-rempli avec les informations existantes
✅ Upload d'image avec prévisualisation instantanée
✅ Validation côté client (taille image) et serveur (ID, existence)
✅ Sauvegarde en base de données MySQL
✅ Feedback temps réel avec toasts (succès/erreur)
✅ Protection de la route (accès réservé aux utilisateurs connectés)

### Stack technique maîtrisée
**Front-end :** React 19 + TypeScript + React Router v7 + React-Toastify
**Back-end :** Express + TypeScript + MySQL2
**Authentification :** JWT (cookies httpOnly)

---

**Réalisation :** Formulaire de modification du profil utilisateur
**Lignes de code :** ~180 (front) + ~40 (back)
**Fichiers :** 3 (UserFormPage.tsx, router.ts, userActions.ts)
