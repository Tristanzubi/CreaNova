# RÉALISATION 3 : PAGE DÉTAIL D'ŒUVRE AVEC AGRÉGATION SQL

## VUE D'ENSEMBLE

### CONTEXTE & OBJECTIF

Développement d'une page de détail permettant d'afficher toutes les informations d'une œuvre (titre, description, prix, tags, statut) ainsi que les informations de l'artiste créateur, avec navigation contextuelle vers le profil de l'artiste.

Route front-end : /artwork/:id
API : GET /api/artwork/:id/artist

### FLUX TECHNIQUE

1. Accès à la page via l'ID de l'œuvre dans l'URL (/artwork/42)
2. Extraction du paramètre :id avec useParams()
3. Requête GET vers /api/artwork/:id/artist
4. Back-end : Requête SQL avec JOIN multiple (artwork, user_account, categories)
5. Agrégation des tags avec GROUP_CONCAT et CASE conditionnelle
6. Affichage conditionnel selon le statut (vendu/disponible)
7. Navigation vers le profil de l'artiste

### TECHNOLOGIES

**Front-end**                       **Back-end**
• React 19 + TypeScript             • Express + TypeScript
• React Router (useParams)          • MySQL2 (agrégation avancée)
• Gestion état de chargement        • Architecture MVC
• Affichage conditionnel            • GROUP_CONCAT + CASE WHEN

### ARCHITECTURE

Front : client/src/pages/ArtworkDetailPage/ArtworkDetailPage.tsx (~85 lignes)
Back : server/src/modules/artwork/artworkActions.ts + artworkRepository.ts
Pattern : Page de consultation + Requête SQL avec agrégation conditionnelle

---

## CODE FRONT-END

### CAPTURE 3.1 : Récupération des données avec gestion du loading

La page utilise useParams() pour extraire l'ID de l'œuvre depuis l'URL. Un état local stocke les données de l'œuvre une fois récupérées. Le useEffect déclenche la requête fetch au montage du composant et à chaque changement d'ID. La gestion d'erreur avec .catch() permet de logger les problèmes de connexion. Pendant le chargement, un message "Chargement..." s'affiche pour informer l'utilisateur.

Fichier : client/src/pages/ArtworkDetailPage/ArtworkDetailPage.tsx (lignes 5-23)

```typescript
function ArtworkDetailPage() {
  const { id } = useParams();

  const [artwork, setArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3310/api/artwork/${id}/artist`)
      .then((res) => res.json())
      .then((data) => {
        setArtwork(data[0]);
      })
      .catch((error) => {
        console.error("Erreur pendant fetch :", error);
      });
  }, [id]);

  if (!artwork) {
    return <p>Chargement...</p>;
  }
```

→ Voir Annexe - Capture 3.1

### CAPTURE 3.2 : Affichage conditionnel et navigation artiste

Le rendu affiche toutes les informations de l'œuvre (titre, description, image, tags, prix). L'affichage du bouton "Ajouter au panier" est conditionnel : si l'œuvre est vendue (artwork.sold = true), un badge "Vendu" apparaît à la place. La section artiste utilise un Link React Router vers /artist/:userId, permettant une navigation fluide vers le profil de l'artiste créateur.

Fichier : client/src/pages/ArtworkDetailPage/ArtworkDetailPage.tsx (lignes 50-83)

```typescript
<figcaption>
  <div className="artwork-details">
    <span>{artwork.title}</span>
    <span className="tags">{artwork.tags}</span>
  </div>
  <span className="price">{artwork.price}€</span>
  {artwork.sold ? (
    <span className="is-sold">Vendu</span>
  ) : (
    <button
      className="add-to-cart"
      type="button"
      aria-label="Ajouter au panier"
    >
      <img src="/img/shopping-cart-white-icon.png" alt="" />
    </button>
  )}
</figcaption>

<h2>Artiste</h2>
<figure className="artist">
  <Link to={`/artist/${artwork.user_account_id}`}>
    <img
      src={`http://localhost:3310/${artwork.artist_image}`}
      alt={`${artwork.firstname} ${artwork.lastname}`}
    />
    <figcaption>
      {artwork.firstname} {artwork.lastname}
    </figcaption>
  </Link>
</figure>
```

→ Voir Annexe - Capture 3.2

---

## CODE BACK-END

### CAPTURE 3.3 : Route et contrôleur

La route GET utilise un paramètre dynamique :id pour identifier l'œuvre à récupérer. Le contrôleur extrait cet ID, le convertit en nombre, puis appelle le repository. La gestion d'erreur distingue les cas 404 (œuvre introuvable) et les erreurs serveur, transmises au middleware next(err) pour un traitement centralisé.

Fichier : server/src/router.ts (ligne 49)

```typescript
router.get("/api/artwork/:id/artist", artworkActions.readArtworkWithArtistById);
```

Fichier : server/src/modules/artwork/artworkActions.ts (lignes 30-43)

```typescript
const readArtworkWithArtistById: RequestHandler = async (req, res, next) => {
  try {
    const artworkId = Number(req.params.id);
    const result = await artworkRepository.readArtworkWithArtistById(artworkId);

    if (!result) {
      res.status(404).json("Artwork not found");
    } else {
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
};
```

→ Voir Annexe - Capture 3.3

### CAPTURE 3.4 : Repository - Requête SQL avec GROUP_CONCAT

Cette requête SQL combine plusieurs techniques avancées. Le JOIN avec user_account récupère les informations de l'artiste (prénom, nom, image). Les LEFT JOIN permettent de gérer les œuvres sans catégories. La fonction GROUP_CONCAT agrège tous les tags (sous-catégories) en une seule chaîne séparée par " - ". La clause CASE WHEN filtre uniquement les catégories marquées comme sous-catégories (is_sub_cat = TRUE), ignorant les catégories principales. Le GROUP BY évite les doublons d'œuvres.

Fichier : server/src/modules/artwork/artworkRepository.ts (lignes 45-62)

```typescript
async readArtworkWithArtistById(artworkId: number) {
  const [rows] = await databaseClient.query<Rows>(
    `SELECT
     a.*,
     ua.firstname AS firstname,
     ua.lastname AS lastname,
     ua.image AS artist_image,
     GROUP_CONCAT(DISTINCT CASE WHEN c.is_sub_cat = TRUE THEN c.name ELSE NULL END SEPARATOR ' - ') AS tags
   FROM artwork AS a
   JOIN user_account AS ua ON a.user_account_id = ua.id
   LEFT JOIN artwork_category AS ac ON a.id = ac.artwork_id
   LEFT JOIN category AS c ON ac.category_id = c.id
   WHERE a.id = ?
   GROUP BY a.id, ua.firstname, ua.lastname, ua.image;`,
    [artworkId],
  );
  return rows;
}
```

→ Voir Annexe - Capture 3.4

Cette implémentation démontre la maîtrise de l'agrégation SQL conditionnelle et de la navigation contextuelle, permettant d'afficher de manière optimisée toutes les informations d'une œuvre et de son artiste en une seule requête.

---

## 📎 ANNEXE - CAPTURES D'ÉCRAN

**Capture 3.1 : Récupération des données avec gestion du loading**
Screenshot du code VS Code montrant useParams, useState, useEffect et gestion du loading (lignes 5-23)

**Capture 3.2 : Affichage conditionnel et navigation artiste**
Screenshot du JSX montrant l'affichage conditionnel (vendu/disponible) et le lien vers l'artiste (lignes 50-83)

**Capture 3.3 : Route et contrôleur**
Screenshot montrant la route dans router.ts (ligne 49) et le contrôleur readArtworkWithArtistById (lignes 30-43)

**Capture 3.4 : Requête SQL avec GROUP_CONCAT**
Screenshot du repository montrant la requête SQL avec JOIN, GROUP_CONCAT et CASE WHEN (lignes 45-62)

---

## RESSENTI PERSONNEL

Le principal défi a été la compréhension de la fonction GROUP_CONCAT combinée avec CASE WHEN pour agréger uniquement les sous-catégories (tags) tout en excluant les catégories principales. Cette technique SQL permet d'éviter une seconde requête pour récupérer les tags.

Cette réalisation m'a permis de maîtriser l'agrégation conditionnelle en SQL et la navigation contextuelle en React Router. Je suis satisfait de la fluidité du parcours utilisateur : depuis la galerie vers le détail d'une œuvre, puis vers le profil de l'artiste, créant une expérience de navigation cohérente.
