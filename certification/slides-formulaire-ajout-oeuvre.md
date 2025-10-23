# Guide des 3 slides : Formulaire d'ajout d'œuvre

## 📁 Fichier source du projet
**Fichier** : `client/src/pages/AddArtworkPage/AddArtworkPage.tsx`

---

## SLIDE 9 : Code - Formulaire d'ajout (1min30)

### 📝 Titre et sous-titre
**Titre** : Code : Formulaire d'ajout
**Sous-titre** : Approche non contrôlée pour optimiser les performances

### 💻 Code à capturer (lignes 68-116 du fichier AddArtworkPage.tsx)

**Code EXACT du projet :**
```jsx
<form className="form" onSubmit={handleSubmit}>
  <label htmlFor="title">Titre de l'oeuvre</label>
  <input type="text" name="title" />

  <label htmlFor="description">Description de l'oeuvre</label>
  <input id="description" type="text" name="description" />

  <input
    type="file"
    name="image"
    id="artwork-image"
    accept="image/png, image/jpg, image/jpeg"
    onChange={handleFile}
  />
  <label htmlFor="artwork-image" className="file-label">
    Choisir une image
  </label>

  <label htmlFor="price">Tarif:</label>
  <input type="text" name="price" />

  <label htmlFor="mainCategory">Catégorie principale</label>
  <select name="mainCategory" id="mainCategory">
    <option value="">Sélectionner une catégorie</option>
    <option value="peinture">Peinture</option>
    <option value="Dessin">Dessin</option>
    <option value="photographie">Photographie</option>
  </select>

  <div>
    <label htmlFor="tag1">Tag 1</label>
    <input type="text" name="tag1" id="tag1" />
    <label htmlFor="tag2">Tag 2</label>
    <input type="text" name="tag2" id="tag2" />
    <label htmlFor="tag3">Tag 3</label>
    <input type="text" name="tag3" id="tag3" />
  </div>

  <button type="submit">Ajouter</button>
</form>
```

### ✅ Points clés à afficher sur la slide

- ✅ **Formulaire non contrôlé** : pas de `value` ni `onChange` sur les inputs texte
- ✅ **Meilleures performances** : pas de re-render à chaque frappe
- ✅ **Attribut `name`** : utilisé pour récupérer les données avec FormData
- ✅ **Support natif des fichiers** : `<input type="file">` géré automatiquement
- ✅ **Code simple** : pas de useState multiples pour chaque champ

### 📸 Capture d'écran recommandée
- **Lignes à capturer** : 68-116 (formulaire complet)
- **Éléments à mettre en évidence** :
  - `name="title"`, `name="description"`, etc.
  - `type="file"` pour l'image
  - `onSubmit={handleSubmit}`
  - Absence de `value={...}` sur les inputs

---

## SLIDE 10 : Code - Validation client (1min30)

### 📝 Titre et sous-titre
**Titre** : Code : Validation de l'image côté client
**Sous-titre** : Vérification avant upload

### 💻 Code à capturer (lignes 14-27 du fichier AddArtworkPage.tsx)

**Code EXACT de votre projet :**
```jsx
const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];

  if (selectedFile) {
    if (selectedFile.size > 500 * 1024) {
      toast.error("La taille de l'image ne doit pas être supérieur à 500ko");
      e.target.value = "";
      setFile(undefined);
      setPreviewImage(undefined);
      return;
    }
    setFile(selectedFile);
    setPreviewImage(URL.createObjectURL(selectedFile));
  }
};
```

### ✅ Points clés à afficher sur la slide

- ✅ **Validation de la taille** : vérification < 500Ko avant upload
- ✅ **Message d'erreur utilisateur** : toast.error() pour feedback immédiat
- ✅ **Réinitialisation du champ** : e.target.value = "" si fichier invalide
- ✅ **Prévisualisation instantanée** : URL.createObjectURL() pour afficher l'image
- ✅ **Évite les uploads inutiles** : validation côté client = économie de bande passante

### 📸 Capture d'écran recommandée
- **Lignes à capturer** : 14-27
- **Éléments à mettre en évidence** :
  - `selectedFile.size > 500 * 1024`
  - `toast.error()`
  - `URL.createObjectURL(selectedFile)`
  - Le `return` qui empêche la suite si erreur

### 🖼️ Bonus : Affichage de la prévisualisation
Vous pouvez ajouter ce code en complément (lignes 86-94) :
```jsx
{file && (
  <section>
    <p>Nom : {file.name}</p>
    <p>Taille : {file.size} bytes</p>
    {previewImage && (
      <img src={previewImage} alt="Prévisualisation" />
    )}
  </section>
)}
```

---

## SLIDE 11 : Code - Soumission FormData (1min30)

### 📝 Titre et sous-titre
**Titre** : Code : Soumission vers l'API
**Sous-titre** : Envoi des données avec FormData

### 💻 Code à capturer (lignes 29-49 du fichier AddArtworkPage.tsx)

**Code EXACT de votre projet :**
```jsx
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  data.append("user_account_id", String(userId));

  const tags = [data.get("tag1"), data.get("tag2"), data.get("tag3")]
    .filter((tag) => typeof tag === "string" && tag.trim() !== "")
    .join(",");
  data.append("tags", tags);

  fetch("http://localhost:3310/api/artworks", {
    method: "POST",
    credentials: "include",
    body: data,
  }).then((res) => {
    if (res.ok) {
      toast.success("Oeuvre ajoutée avec succès !");
    } else {
      throw new Error("Erreur lors de l'ajout");
    }
  });
};
```

### ✅ Points clés à afficher sur la slide

- ✅ **FormData récupère automatiquement** tous les champs du formulaire
- ✅ **Gère les fichiers + texte ensemble** : multipart/form-data automatique
- ✅ **Pas besoin de JSON.stringify** : le FormData gère tout
- ✅ **Traitement des tags multiples** : filter() + join() pour créer une chaîne
- ✅ **credentials: "include"** : envoie le JWT cookie pour l'authentification
- ✅ **Feedback utilisateur** : toast.success() après ajout réussi

### 📸 Capture d'écran recommandée
- **Lignes à capturer** : 29-49
- **Éléments à mettre en évidence** :
  - `new FormData(e.currentTarget)`
  - `data.append("user_account_id", String(userId))`
  - La logique des tags (lignes 33-36)
  - `credentials: "include"`
  - `body: data` (pas de JSON.stringify)

### 🎯 Note importante sur les tags
Expliquer la logique :
```jsx
// Récupération des 3 tags
[data.get("tag1"), data.get("tag2"), data.get("tag3")]
  // Suppression des tags vides
  .filter((tag) => typeof tag === "string" && tag.trim() !== "")
  // Conversion en string "tag1,tag2,tag3"
  .join(",");
```

---

## 🎨 STRUCTURE VISUELLE COMMUNE (rappel)

```
┌────────────────────────────────────────┐
│  [TITRE]                          9/28 │
│  [Sous-titre]                          │
├────────────────┬───────────────────────┤
│                │                       │
│  [CODE]        │  Points clés :        │
│  (gauche 50%)  │  • Point 1            │
│                │  • Point 2            │
│                │  • Point 3            │
│                │  • Point 4            │
│                │  • Point 5            │
│                │                       │
└────────────────┴───────────────────────┘
```

---

## ⏱️ TIMING TOTAL

```
SLIDE 9  : 1min30 (Structure du formulaire)
SLIDE 10 : 1min30 (Validation client)
SLIDE 11 : 1min30 (Soumission API)
─────────────────────────────────────────
TOTAL    : 4min30 ✅
```

---

## ✏️ CHECKLIST DE CRÉATION DES SLIDES

### Slide 9 - Formulaire
- [ ] Copier le titre et sous-titre
- [ ] Capturer le code JSX du formulaire (lignes 68-116)
- [ ] Ajouter les 5 points clés à droite
- [ ] Mettre en évidence les attributs `name`
- [ ] Vérifier que le code tient sur la slide

### Slide 10 - Validation
- [ ] Copier le titre et sous-titre
- [ ] Capturer la fonction handleFile (lignes 14-27)
- [ ] Ajouter les 5 points clés à droite
- [ ] Mettre en évidence la condition `> 500 * 1024`
- [ ] (Optionnel) Ajouter screenshot de la prévisualisation

### Slide 11 - Soumission
- [ ] Copier le titre et sous-titre
- [ ] Capturer la fonction handleSubmit (lignes 29-49)
- [ ] Ajouter les 6 points clés à droite
- [ ] Mettre en évidence `new FormData` et la logique des tags
- [ ] Vérifier que tous les éléments sont lisibles

---

## 🔗 RÉFÉRENCES DANS LE PROJET

**Fichier principal** : [client/src/pages/AddArtworkPage/AddArtworkPage.tsx](../client/src/pages/AddArtworkPage/AddArtworkPage.tsx)

**Technologies utilisées** :
- React 19 avec TypeScript
- FormData API native
- react-toastify pour les notifications
- react-router pour la navigation

**Contexte métier** :
Les artistes utilisent ce formulaire pour ajouter leurs œuvres à la galerie CreaNova. Le formulaire permet l'upload d'image, la saisie d'informations détaillées et la catégorisation avec des tags.

---

## 💡 CONSEILS POUR LA PRÉSENTATION

### Slide 9 (Formulaire)
- Insister sur la **simplicité** : pas de state, juste des `name`
- Montrer la **diversité des champs** : text, file, select
- Expliquer pourquoi **pas de defaultValue** ici (formulaire de création, pas d'édition)

### Slide 10 (Validation)
- Mettre l'accent sur l'**expérience utilisateur** : erreur immédiate
- Expliquer l'**économie de ressources** : validation avant upload
- Montrer la **prévisualisation** comme bonus UX

### Slide 11 (Soumission)
- Expliquer la **puissance de FormData** : tout en un
- Détailler la **logique métier** des tags (filter + join)
- Souligner l'**authentification** avec credentials

---

## 🎯 MESSAGES CLÉS À RETENIR

1. **Formulaire non contrôlé** = performances + simplicité
2. **Validation côté client** = meilleure UX + économie serveur
3. **FormData** = solution native pour formulaires avec fichiers
4. **Code production-ready** : gestion d'erreurs, feedback utilisateur, sécurité
