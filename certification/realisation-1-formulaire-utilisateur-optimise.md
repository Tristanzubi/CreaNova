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

Pour gérer ce formulaire, j'ai mis en place deux états React distincts : `userData` qui stocke les données récupérées depuis la base de données, et `previewImage` qui permet d'afficher un aperçu de l'image sélectionnée avant l'upload. L'utilisation du hook personnalisé `useAuth()` me permet d'accéder facilement aux informations de l'utilisateur connecté depuis n'importe quel composant.

**Fichier :** `client/src/pages/UserFormPage/UserFormPage.tsx` (lignes 8-12)

```typescript
function UserFormPage() {
  const { user, isLogged } = useAuth();
  const [userData, setUserData] = useState<UserFormData | null>(null);
  const [previewImage, setPreviewImage] = useState<string>();
```

**→ Voir Annexe - Capture 1**

---

### 📸 CAPTURE 2 : Récupération et pré-remplissage

Dès le chargement de la page, j'utilise un `useEffect` pour récupérer automatiquement les données de l'utilisateur connecté. L'option `credentials: "include"` est essentielle car elle envoie le cookie JWT avec la requête, permettant au serveur d'authentifier l'utilisateur. Les données récupérées sont ensuite stockées dans l'état pour pré-remplir le formulaire, offrant une expérience fluide où l'utilisateur voit immédiatement ses informations actuelles.

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

**→ Voir Annexe - Captures 2a et 2b**

---

### 📸 CAPTURE 3 : Validation upload d'image

La gestion de l'upload d'image de profil nécessite une validation côté client pour garantir une bonne performance. J'ai implémenté une vérification de la taille du fichier (limite à 500ko) qui évite d'envoyer des images trop volumineuses au serveur. Si la validation échoue, le champ est réinitialisé et un message d'erreur s'affiche via un toast. Dans le cas contraire, `URL.createObjectURL()` génère instantanément une prévisualisation de l'image sélectionnée.

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

**→ Voir Annexe - Capture 3**

---

### 📸 CAPTURE 4 : Soumission du formulaire

La soumission du formulaire utilise l'API FormData native qui récupère automatiquement toutes les valeurs des inputs grâce à leur attribut `name`. Cela simplifie considérablement le code en évitant de gérer chaque champ individuellement. La requête PUT est envoyée avec le JWT (via `credentials: "include"`) pour authentifier l'utilisateur. Un système de toasts informe immédiatement l'utilisateur du succès ou de l'échec de l'opération.

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

**→ Voir Annexe - Captures 4a, 4b et 4c**

---

### 📸 CAPTURE 5 : Formulaire HTML

J'ai conçu un formulaire non contrôlé utilisant `defaultValue` plutôt que `value`, ce qui permet de pré-remplir les champs tout en laissant React gérer les performances de manière optimale. Chaque input possède un attribut `name` correspondant exactement aux clés attendues par le back-end, ce qui rend le code plus maintenable et évite les erreurs de mapping. Le formulaire couvre toutes les informations personnelles : nom, prénom, email, adresse complète et description.

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

**→ Voir Annexe - Capture 5**

---

## 🔧 CODE BACK-END

### 📸 CAPTURE 6 : Routes API

Côté back-end, j'ai configuré deux routes RESTful distinctes suivant les conventions HTTP : GET pour récupérer les données et PUT pour les mettre à jour. Les routes utilisent des paramètres dynamiques (`:id`) pour identifier l'utilisateur concerné. Cette séparation claire respecte l'architecture MVC et facilite la maintenance du code.

**Fichier :** `server/src/router.ts` (lignes 80-86)

```typescript
router.get("/api/user/:id", userActions.getUserById);
router.put("/api/user/:id", userActions.editUser);
```

**→ Voir Annexe - Capture 6**

---

### 📸 CAPTURE 7 : Contrôleur - Récupération

Le contrôleur `getUserById` implémente une validation rigoureuse avant d'interroger la base de données. Je convertis d'abord l'ID en nombre et vérifie sa validité. Si l'utilisateur n'existe pas, un code HTTP 404 est retourné. Cette gestion précise des cas d'erreur améliore la robustesse de l'API et facilite le débogage côté front-end grâce à des codes HTTP explicites.

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

**→ Voir Annexe - Capture 7**

---

### 📸 CAPTURE 8 : Contrôleur - Mise à jour

Le contrôleur `editUser` suit la même logique de validation que `getUserById`, mais effectue ensuite un UPDATE en base de données. L'utilisation de `affectedRows` permet de vérifier si l'utilisateur existait réellement : si aucune ligne n'est affectée, cela signifie que l'ID est invalide. Le repository gère la requête SQL, respectant ainsi la séparation des responsabilités de l'architecture MVC.

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

## 💭 RESSENTI PERSONNEL

Cette fonctionnalité a été ma première vraie immersion dans la gestion de formulaires complexes avec React et TypeScript. Au début, j'ai hésité entre utiliser un formulaire contrôlé ou non contrôlé, et j'ai finalement opté pour `defaultValue` qui offrait le meilleur compromis entre simplicité et performance.

**Défis rencontrés :**
Le principal défi a été de comprendre le cycle de vie de React avec `useEffect` pour récupérer les données au bon moment. J'ai également dû apprendre à gérer l'asynchronicité entre la récupération des données et l'affichage du formulaire. La gestion de l'upload d'image avec prévisualisation a nécessité de découvrir l'API `URL.createObjectURL()`, que je ne connaissais pas auparavant.

**Apprentissages clés :**
Cette réalisation m'a permis de maîtriser plusieurs concepts fondamentaux :
- La **communication front-back** avec authentification JWT via cookies
- L'utilisation de **FormData** pour gérer simplement les formulaires avec fichiers
- La **gestion d'état asynchrone** avec useEffect et les bonnes pratiques React
- L'importance du **feedback utilisateur** avec des toasts pour une meilleure UX
- La **validation côté client** pour optimiser les performances et l'expérience utilisateur

**Satisfaction :**
Je suis particulièrement fier de la fluidité de l'expérience utilisateur : le pré-remplissage automatique, la prévisualisation instantanée de l'image, et les retours immédiats via les toasts créent une interface intuitive et réactive. Côté technique, l'utilisation de `defaultValue` et FormData rend le code très maintenable et facile à étendre si de nouveaux champs doivent être ajoutés.

Cette fonctionnalité m'a donné confiance dans ma capacité à créer des interfaces utilisateur complètes et à gérer l'ensemble du cycle de vie d'une requête HTTP de bout en bout.

---

**Réalisation :** Formulaire de modification du profil utilisateur
**Lignes de code :** ~180 (front) + ~40 (back)
**Fichiers :** 3 (UserFormPage.tsx, router.ts, userActions.ts)
