# Réalisation 4 - Test End-to-End : Login

## Description

Test E2E avec Playwright pour valider la connexion utilisateur.

**Fichier** : `client/tests/login.spec.ts`

## Code du test

```typescript
import { expect, test } from "@playwright/test";
import "dotenv/config";

test("A user should be logged in", async ({ page }) => {
  const password = process.env.PASSWORD_TEST;

  await page.goto("http://localhost:3000/login");

  const emailInput = page.locator("input[type='email']");
  await emailInput.fill("abolfazl@example.com");

  const passwordInput = page.locator("input[type='password']");
  await passwordInput.fill(password as string);

  const button = page.locator("button");
  await button.click();

  const toast = page.getByText("Vous êtes connecté", { exact: true });
  await expect(toast).toBeVisible();
});
```

## Explication du code

Le test utilise l'API Playwright pour automatiser les actions d'un utilisateur :

- **`page.locator()`** : Sélectionne les éléments du DOM par leurs attributs CSS (type d'input, type de bouton)
- **`fill()`** : Simule la saisie clavier dans les champs de formulaire
- **`click()`** : Simule un clic de souris sur le bouton
- **`getByText()`** : Recherche un élément contenant le texte exact spécifié
- **`expect().toBeVisible()`** : Assertion qui vérifie que l'élément toast est affiché à l'écran

La variable d'environnement `PASSWORD_TEST` permet de ne pas exposer le mot de passe en clair dans le code source.

## Scénario testé

1. Navigation vers `/login`
2. Saisie de l'email : `abolfazl@example.com`
3. Saisie du mot de passe (stocké dans `.env`)
4. Clic sur le bouton de connexion
5. Vérification que le message "Vous êtes connecté" apparaît

## Exécution

```bash
# Lancer le test
npm run test --workspace=client

# Mode UI interactif
npx playwright test --ui --workspace=client

# Voir le rapport
npx playwright show-report --workspace=client
```

## Configuration requise

- Variable d'environnement : `PASSWORD_TEST` dans `client/.env`
- Serveurs démarrés : `npm run dev`
- Utilisateur existant en BDD : `abolfazl@example.com`

## Résultat attendu

Le test passe si l'utilisateur se connecte avec succès et le toast de confirmation s'affiche dans les 3 navigateurs testés (Chromium, Firefox, WebKit).
