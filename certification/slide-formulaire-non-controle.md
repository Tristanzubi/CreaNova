# Slide : Formulaire non contrôlé - Guide de mise à jour

## 📋 Titre et sous-titre à modifier

**Titre principal :**
```
Formulaires non contrôlés avec React
```

**Sous-titre :**
```
Choix technique : defaultValue au lieu de value + onChange
```

---

## 💻 Code à capturer et afficher

### ✅ CODE EXACT DE VOTRE PROJET (AddArtworkPage.tsx)

#### Option 1 : Extrait simplifié pour la slide
```jsx
function AddArtworkPage() {
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
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" />
      <input type="text" name="description" />
      <input type="file" name="image" />
      <input type="text" name="price" />
      <select name="mainCategory">
        <option value="peinture">Peinture</option>
      </select>
      <button type="submit">Ajouter</button>
    </form>
  );
}
```

#### Option 2 : Version plus complète (si espace suffisant)
```jsx
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Récupération automatique de tous les champs
  const data = new FormData(e.currentTarget);
  data.append("user_account_id", String(userId));

  // Traitement des tags multiples
  const tags = [data.get("tag1"), data.get("tag2"), data.get("tag3")]
    .filter((tag) => typeof tag === "string" && tag.trim() !== "")
    .join(",");
  data.append("tags", tags);

  // Envoi direct du FormData (avec fichier image)
  fetch("http://localhost:3310/api/artworks", {
    method: "POST",
    credentials: "include",
    body: data, // FormData gère automatiquement multipart/form-data
  }).then((res) => {
    if (res.ok) {
      toast.success("Oeuvre ajoutée avec succès !");
    }
  });
};
```

---

## 📝 Texte de la section "Utilisation de defaultValue"

**Titre :** Utilisation de defaultValue

**Contenu :**
- Les champs utilisent `defaultValue` au lieu de `value`
- Pas de state React pour gérer chaque champ
- Récupération des données via FormData au submit
- React ne contrôle pas les valeurs en temps réel

---

## ✅ Texte de la section "Avantages de cette approche"

**Titre :** Avantages de cette approche

**Liste :**
- **Meilleures performances** : pas de re-render à chaque frappe
- **Code simplifié** : moins de useState et de gestionnaires d'événements
- **Pré-remplissage facile** : idéal pour les formulaires d'édition
- **FormData natif** : récupération simple et structurée des données

---

## 🎯 Section bonus à ajouter : "Cas d'usage idéal"

**Titre :** Quand utiliser cette approche ?

**Contenu :**
Cette méthode est particulièrement adaptée pour :
- Formulaires d'édition d'œuvres existantes
- Formulaires sans validation en temps réel
- Optimisation des performances (nombreux champs)
- Données provenant d'une API à pré-remplir

**Contre-indications :**
- Validation en temps réel requise
- Champs interdépendants nécessitant des calculs
- Feedback immédiat à l'utilisateur obligatoire

---

## 📸 Suggestions pour la capture d'écran de code

**Fichier à capturer :** `client/src/pages/AddArtwork.tsx` (lignes pertinentes)

**Éléments à mettre en évidence dans le code :**
1. `defaultValue={artwork?.title}`
2. `const formData = new FormData(event.target)`
3. `formData.get('title')`
4. Absence de `useState` pour les champs

**Paramètres de capture recommandés :**
- Thème sombre (comme sur la slide actuelle)
- Police : Fira Code ou JetBrains Mono
- Taille de police : 14-16px
- Largeur : adaptée pour la slide

---

## 🎨 Suggestions visuelles

1. **Ajouter un schéma comparatif** (optionnel) :
   ```
   Formulaire contrôlé          Formulaire non contrôlé
   ─────────────────            ──────────────────────
   value={state}        →       defaultValue={data}
   onChange={setState}  →       ❌ (pas besoin)
   Re-render constant   →       ✅ Une seule fois
   ```

2. **Code highlighting** : mettre en couleur différente
   - `defaultValue` en jaune
   - `FormData` en vert
   - `get()` en bleu

3. **Ajouter une note en bas** :
   ```
   💡 Note : Dans CreaNova, cette approche est utilisée pour le
   formulaire d'ajout d'œuvres par les artistes (AddArtwork.tsx)
   ```

---

## ✏️ Checklist de mise à jour

- [ ] Changer le titre principal
- [ ] Modifier le sous-titre
- [ ] Remplacer le code affiché
- [ ] Mettre à jour la liste des avantages
- [ ] Ajouter la section "Cas d'usage idéal"
- [ ] Capturer une nouvelle screenshot de votre code réel
- [ ] Vérifier l'alignement et la lisibilité
- [ ] Relire pour les fautes d'orthographe

---

## 🔗 Référence du projet

**Fichier réel du projet à référencer :**
- `client/src/pages/AddArtwork.tsx` (formulaire d'ajout d'œuvre)
- Lignes utilisant `defaultValue` pour les champs du formulaire

**Contexte :** Ce formulaire permet aux artistes d'ajouter leurs œuvres avec upload d'image, et utilise l'approche non contrôlée pour optimiser les performances.
