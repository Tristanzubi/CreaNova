**RÉALISATION 2 : AJOUT D'UNE ŒUVRE AVEC GESTION DE CATÉGORIES**

**VUE D'ENSEMBLE**

**CONTEXTE & OBJECTIF**

Développement d'une fonctionnalité permettant aux artistes connectés d'ajouter leurs œuvres avec upload d'image, gestion de tags et catégories principales.

Route front-end : /artist/:userId/add-artwork
API : POST /api/artworks

**FLUX TECHNIQUE**

1. Chargement de /artist/:userId/add-artwork → Vérification utilisateur connecté
2. Sélection d'image → Validation taille (500ko max) → Prévisualisation
3. Remplissage formulaire (titre, description, prix, catégorie, 3 tags)
4. Soumission → Requête POST avec FormData
5. Back-end : INSERT artwork + gestion catégories (création si inexistante)
6. Relations many-to-many créées dans artwork_category
7. Confirmation toast

**TECHNOLOGIES**

Front-end                           Back-end
• React 19 + TypeScript             • Express + TypeScript
• React Router v7                   • MySQL2 (transactions multiples)
• React-Toastify                    • Architecture MVC
• FormData API                      • Multer (upload fichiers)

**ARCHITECTURE**

Front : client/src/pages/AddArtworkPage/AddArtworkPage.tsx (~125 lignes)
Back : server/src/modules/artwork/artworkActions.ts + artworkRepository.ts
Pattern : Architecture MVC + Relations many-to-many


**CODE FRONT-END**

**CAPTURE 1 : État initial et validation d'image**

La première étape consiste à mettre en place la gestion de l'upload d'image. J'ai créé deux états locaux : un pour stocker le fichier sélectionné et un autre pour afficher la prévisualisation. La validation côté client vérifie que l'image ne dépasse pas 500ko, ce qui permet d'éviter des uploads trop lourds et d'optimiser les performances du serveur.

Fichier : client/src/pages/AddArtworkPage/AddArtworkPage.tsx (lignes 8-27)

```typescript
function AddArtworkPage() {
  const { userId } = useParams();
  const { isLogged } = useAuth();
  const [file, setFile] = useState<File | undefined>();
  const [previewImage, setPreviewImage] = useState<string>();

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

→ Voir Annexe - Capture 1

**CAPTURE 2 : Soumission avec gestion des tags**

Lors de la soumission du formulaire, j'ai mis en place une logique pour assembler les 3 tags optionnels en une seule chaîne de caractères séparée par des virgules. Le filtrage permet d'éliminer les champs vides grâce à .filter() et .trim(), ce qui évite d'envoyer des données inutiles au serveur. L'ID de l'utilisateur est également ajouté dynamiquement au FormData pour lier l'œuvre à son créateur.

Fichier : client/src/pages/AddArtworkPage/AddArtworkPage.tsx (lignes 29-49)

```typescript
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  data.append("user_account_id", String(userId));

  // Assemblage des 3 tags en une seule chaîne
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

→ Voir Annexe - Captures 2a et 2b

**CAPTURE 3 : Formulaire avec catégories et tags**

Le formulaire est conçu pour offrir une expérience utilisateur complète. L'input file est configuré avec l'attribut accept pour n'accepter que les formats image (PNG, JPG, JPEG). La prévisualisation s'affiche conditionnellement uniquement si un fichier est sélectionné. J'ai également intégré un menu déroulant pour la catégorie principale et trois champs de texte pour les tags, permettant ainsi aux artistes de classer leurs œuvres de manière flexible.

Fichier : client/src/pages/AddArtworkPage/AddArtworkPage.tsx (lignes 68-116)

```typescript
<form className="form" onSubmit={handleSubmit}>
  <label htmlFor="title"> Titre de l'oeuvre </label>
  <input type="text" name="title" />

  <label htmlFor="description"> Description de l'oeuvre</label>
  <input id="description" type="text" name="description" />

  <input
    type="file"
    name="image"
    id="artwork-image"
    accept="image/png, image/jpg, image/jpeg"
    onChange={handleFile}
  />

  {file && (
    <section>
      <p>Nom : {file.name}</p>
      <p>Taille : {file.size} bytes</p>
      {previewImage && <img src={previewImage} alt="Prévisualisation" />}
    </section>
  )}

  <label htmlFor="mainCategory"> Catégorie principale</label>
  <select name="mainCategory" id="mainCategory">
    <option value="">Sélectionner une catégorie</option>
    <option value="peinture">Peinture</option>
    <option value="Dessin">Dessin</option>
    <option value="photographie">Photographie</option>
  </select>

  <div>
    <label htmlFor="tag1"> Tag 1</label>
    <input type="text" name="tag1" id="tag1" />
    <label htmlFor="tag2"> Tag 2</label>
    <input type="text" name="tag2" id="tag2" />
    <label htmlFor="tag3"> Tag 3</label>
    <input type="text" name="tag3" id="tag3" />
  </div>

  <button type="submit">Ajouter</button>
</form>
```

→ Voir Annexe - Capture 3


**CODE BACK-END**

**CAPTURE 4 : Route et middleware**

Côté back-end, j'ai configuré la route POST avec un chaînage de middlewares. Le premier middleware file.imageUpload utilise Multer pour gérer l'upload du fichier. Le second file.appImage effectue le traitement de l'image (redimensionnement, compression, renommage). Enfin, le contrôleur createArtwork prend le relais pour la logique métier et l'insertion en base de données.

Fichier : server/src/router.ts (lignes 71-76)

```typescript
router.post(
  "/api/artworks",
  file.imageUpload,
  file.appImage,
  artworkActions.createArtwork,
);
```

→ Voir Annexe - Capture 4

**CAPTURE 5 : Contrôleur - Filtrage des tags**

Dans le contrôleur, j'ai implémenté une logique de nettoyage des tags pour éviter les doublons et les incohérences. La chaîne de tags reçue du front-end est d'abord splittée par virgule, puis chaque tag est nettoyé avec .trim(). J'utilise ensuite new Set() pour éliminer automatiquement les doublons. Le filtre final supprime également les tags qui seraient identiques à la catégorie principale, évitant ainsi la redondance dans la base de données.

Fichier : server/src/modules/artwork/artworkActions.ts (lignes 94-124)

```typescript
const createArtwork: RequestHandler = async (req, res, next) => {
  try {
    const { tags, mainCategory } = req.body;

    // Filtrage et déduplication des tags
    const filteredTags = Array.from(
      new Set(
        (typeof tags === "string"
          ? tags.split(",").map((tag) => tag.trim())
          : []
        ).filter(
          (tag) =>
            tag &&
            (!mainCategory || tag.toLowerCase() !== mainCategory.toLowerCase()),
        ),
      ),
    );

    const artworkData = {
      ...req.body,
      tags: filteredTags,
    };

    const createArtwork = await artworkRepository.createArtwork(artworkData);
    if (createArtwork) {
      res.status(200).json("The work is added 🎊");
    } else {
      res.status(404).json("Artwork not created 🤨");
    }
  } catch (err) {
    next(err);
  }
};
```

→ Voir Annexe - Capture 5

**CAPTURE 6 : Repository - Insertion de l'œuvre**

Le repository commence par insérer l'œuvre dans la table artwork avec ses informations de base : titre, description, prix, image et l'ID de l'utilisateur. La récupération de result.insertId est cruciale car cet identifiant sera utilisé immédiatement après pour créer les relations many-to-many entre l'œuvre et ses catégories/tags. C'est la première étape d'une séquence de requêtes SQL coordonnées.

Fichier : server/src/modules/artwork/artworkRepository.ts (lignes 79-90)

```typescript
async createArtwork(body: Artwork) {
  const [result] = await databaseClient.query<Result>(
    "INSERT INTO artwork (title, description, price, image, user_account_id) VALUES (?, ?, ?, ?, ?)",
    [
      body.title,
      body.description,
      body.price,
      body.image,
      body.user_account_id,
    ],
  );

  const artworkId = result.insertId;
```

→ Voir Annexe - Capture 6

**CAPTURE 7 : Repository - Gestion catégorie principale**

Cette partie implémente une logique d'insertion conditionnelle pour la catégorie principale. Je vérifie d'abord si la catégorie existe déjà dans la base avec is_sub_cat = FALSE. Si elle existe, je récupère simplement son ID. Sinon, je la crée automatiquement. Cette approche permet au système d'évoluer dynamiquement : si un artiste saisit une nouvelle catégorie, elle est automatiquement ajoutée sans intervention manuelle. Enfin, je crée la relation dans la table artwork_category.

Fichier : server/src/modules/artwork/artworkRepository.ts (lignes 93-115)

```typescript
if (body.mainCategory) {
  const [mainRows] = await databaseClient.query<Rows>(
    "SELECT id FROM category WHERE name = ? AND is_sub_cat = FALSE",
    [body.mainCategory],
  );

  let mainCategoryId: number;

  if (mainRows.length > 0) {
    mainCategoryId = (mainRows[0] as { id: number }).id;
  } else {
    const [insertMain] = await databaseClient.query<Result>(
      "INSERT INTO category (name, is_sub_cat) VALUES (?, FALSE)",
      [body.mainCategory],
    );
    mainCategoryId = insertMain.insertId;
  }

  await databaseClient.query<Result>(
    "INSERT INTO artwork_category (artwork_id, category_id) VALUES (?, ?)",
    [artworkId, mainCategoryId],
  );
}
```

→ Voir Annexe - Capture 7

**CAPTURE 8 : Repository - Gestion des tags (sous-catégories)**

La gestion des tags fonctionne sur le même principe que la catégorie principale, mais avec une boucle pour traiter chaque tag individuellement. Pour chaque tag, je vérifie son existence dans la table category, puis je le crée si nécessaire (avec is_sub_cat = TRUE par défaut, ce qui le distingue des catégories principales). Chaque tag génère ensuite une entrée dans artwork_category, créant ainsi une relation many-to-many flexible. Cette approche permet à une œuvre d'avoir plusieurs tags et à un tag d'être associé à plusieurs œuvres.

Fichier : server/src/modules/artwork/artworkRepository.ts (lignes 117-144)

```typescript
if (body.tags && body.tags.length > 0) {
  for (const tagName of body.tags) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id FROM category WHERE name = ?",
      [tagName],
    );

    let categoryId: number;

    if (rows.length > 0) {
      categoryId = (rows[0] as { id: number }).id;
    } else {
      const [insertCatResult] = await databaseClient.query<Result>(
        "INSERT INTO category (name) VALUES (?)",
        [tagName],
      );
      categoryId = insertCatResult.insertId;
    }

    await databaseClient.query<Result>(
      "INSERT INTO artwork_category (artwork_id, category_id) VALUES (?, ?)",
      [artworkId, categoryId],
    );
  }
}

return result.affectedRows;
```

→ Voir Annexe - Capture 8

Cette implémentation démontre la maîtrise des relations many-to-many avec insertion conditionnelle, permettant une gestion dynamique et évolutive des catégories et tags sans intervention manuelle.

**📎 ANNEXE - CAPTURES D'ÉCRAN**

**Capture 1 : Validation et prévisualisation d'image**
Screenshot du code de validation (lignes 14-27) + interface avec prévisualisation

**Capture 2a : Code de soumission avec assemblage des tags**
Screenshot du code handleSubmit (lignes 29-49)

**Capture 2b : Requête POST dans DevTools**
Screenshot DevTools → Network → Requête POST avec FormData (tags, image, catégorie)

**Capture 3 : Formulaire complet**
Screenshot de l'interface utilisateur avec tous les champs (titre, description, image, catégorie, 3 tags)

**Capture 4 : Route avec middlewares**
Screenshot du router.ts montrant le chaînage de middlewares (lignes 71-76)

**Capture 5 : Filtrage des tags côté serveur**
Screenshot du contrôleur createArtwork montrant la logique de déduplication (lignes 94-124)

**Capture 6 : Insertion de l'œuvre**
Screenshot du repository montrant l'INSERT principal (lignes 79-90)

**Capture 7 : Gestion de la catégorie principale**
Screenshot du repository montrant la logique conditionnelle (lignes 93-115)

**Capture 8 : Gestion des tags en boucle**
Screenshot du repository montrant la boucle sur les tags (lignes 117-144)

**RESSENTI PERSONNEL**

Le principal défi a été la gestion des relations many-to-many avec insertion conditionnelle. Coordonner la séquence SELECT → INSERT → récupération ID → création relation, le tout dans une boucle pour les tags, m'a demandé une réflexion approfondie sur la synchronisation des requêtes SQL.

Cette réalisation m'a permis de maîtriser l'insertion conditionnelle en SQL et le traitement de données complexes côté serveur (déduplication avec Set, filtrage). Je suis satisfait de l'expérience utilisateur fluide (prévisualisation instantanée, feedback immédiat) et de la logique back-end évolutive qui rend le système autonome pour la maintenance future.
