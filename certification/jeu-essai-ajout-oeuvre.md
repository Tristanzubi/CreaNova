# JEU D'ESSAI - AJOUT D'ŒUVRE

## FONCTIONNALITÉ TESTÉE

**Description :** Ajout d'une œuvre par un artiste authentifié avec upload d'image, gestion de catégories et tags.

**Route front-end :** /artist/:userId/add-artwork
**API :** POST /api/artworks
**Réalisation concernée :** Réalisation 2 - Ajout d'œuvre avec gestion de catégories

---

## TEST : CAS NOMINAL

### Contexte du test

Test de l'ajout d'une œuvre avec tous les champs remplis correctement, incluant une catégorie principale et deux tags.

**Prérequis :** Utilisateur authentifié (ID 1) ayant accès à la page `/artist/1/add-artwork`.

### Données en entrée

| Champ | Valeur saisie |
|-------|---------------|
| **Titre** | "Paysage urbain" |
| **Description** | "Vue de Paris au crépuscule" |
| **Prix** | 350 |
| **Image** | paysage.jpg (450 Ko) |
| **Catégorie principale** | "Photographie" |
| **Tag 1** | "urbain" |
| **Tag 2** | "nocturne" |
| **Tag 3** | *(vide)* |

→ Voir Annexe - Capture JE.1

### Résultat du test

**Réponse du serveur :**
- ✅ Status HTTP : 200 OK
- ✅ Message : "The work is added 🎊"

→ Voir Annexe - Capture JE.2 (DevTools Network)

**Vérification en base de données :**

**Table `artwork` :**
- ✅ Nouvelle œuvre créée (id=42)
- ✅ Titre : "Paysage urbain"
- ✅ Description : "Vue de Paris au crépuscule"
- ✅ Prix : 350
- ✅ Image : "paysage-1234567890.jpg" (renommée par le serveur)
- ✅ user_account_id : 1

**Table `artwork_category` :**
- ✅ 3 relations créées :
  - Catégorie "Photographie" (catégorie principale)
  - Tag "urbain" (sous-catégorie créée)
  - Tag "nocturne" (sous-catégorie créée)

→ Voir Annexe - Capture JE.3 (Base de données)

**Interface utilisateur :**
- ✅ Toast "Oeuvre ajoutée avec succès !" affiché

→ Voir Annexe - Capture JE.4 (Toast)

### Analyse des écarts

**✅ AUCUN ÉCART DÉTECTÉ**

Le flux complet fonctionne conformément aux attentes :

1. **Upload et traitement de l'image** : OK
   - L'image est bien uploadée et traitée par le middleware Multer
   - Le fichier est renommé avec un timestamp pour éviter les conflits
   - La validation de taille (< 500Ko) fonctionne

2. **Insertion de l'œuvre** : OK
   - Les données sont correctement insérées dans la table `artwork`
   - L'ID utilisateur est bien lié à l'œuvre

3. **Gestion des catégories** : OK
   - La catégorie principale existante n'est pas dupliquée
   - La relation artwork-catégorie est créée dans `artwork_category`

4. **Création des tags** : OK
   - Les deux tags sont créés en tant que sous-catégories (is_sub_cat=TRUE)
   - Les relations many-to-many sont établies correctement
   - Les tags vides (Tag 3) ne sont pas insérés

5. **Retour utilisateur** : OK
   - Le toast de confirmation s'affiche correctement
   - Le message est clair et rassurant pour l'utilisateur

**Conclusion :** La fonctionnalité d'ajout d'œuvre est pleinement opérationnelle. Le code gère correctement l'insertion conditionnelle des catégories (évite les doublons), la création des relations many-to-many, et le filtrage des tags vides.

---

## ANNEXE - CAPTURES JEU D'ESSAI

**Capture JE.1 : Formulaire rempli avec les données de test**
Screenshot de l'interface utilisateur montrant le formulaire d'ajout d'œuvre complété avec tous les champs (titre, description, prix, image, catégorie, tags).

**Capture JE.2 : DevTools - Requête POST et réponse serveur**
Screenshot de l'onglet Network des DevTools montrant la requête POST vers /api/artworks avec le FormData et la réponse 200.

**Capture JE.3 : Base de données - Vérification des données**
Screenshot de la base de données (MySQL terminal, phpMyAdmin ou équivalent) montrant la nouvelle œuvre créée dans `artwork` et les relations dans `artwork_category`.

**Capture JE.4 : Interface utilisateur - Toast de confirmation**
Screenshot de l'interface montrant le toast "Oeuvre ajoutée avec succès !" en bas à droite de l'écran.

---

## NOTES COMPLÉMENTAIRES

**Environnement de test :**
- Navigateur : Chrome/Firefox
- Utilisateur : ID 1 (artiste authentifié)
- Base de données : MySQL en local (port 3306)

**Points de validation supplémentaires testés :**
- ✅ Validation de la taille d'image côté client (< 500Ko)
- ✅ Protection contre l'injection SQL via prepared statements
- ✅ Authentification requise (hook useAuth)
- ✅ Déduplication des tags (via Set() côté serveur)
