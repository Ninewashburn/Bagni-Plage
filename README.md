# Bagni Plage

Application fullstack de réservation de services de plage : choix d'un site, réservation d'un parasol, sélection du mobilier, paiement simulé et facture PDF.

L'interface s'inspire de produits de réservation comme Pathé ou Airbnb : une page d'accueil orientée destination, des informations pratiques, un parcours client simple et un espace concessionnaire pour gérer les réservations.

## Stack

| Couche | Technologies |
| --- | --- |
| Backend | Java 21, Spring Boot 3.4.5, Maven |
| API | REST, Spring Security, JWT, SpringDoc OpenAPI |
| Données | PostgreSQL, Spring Data JPA, Flyway |
| Frontend | Angular 19, TypeScript strict, Angular Material, Signals |
| Tests | JUnit 5, Mockito, Vitest, Playwright |
| Infra | Docker Compose, Nginx, GitHub Actions |

## Architecture

```text
frontend Angular
  |
  | /api
  v
backend Spring Boot
  |
  v
PostgreSQL
```

Le frontend utilise des appels relatifs `/api`, ce qui permet de fonctionner avec le proxy Nginx en Docker et avec un proxy/dev-server en développement.

## Fonctionnalités

- Accueil public avec guide côtier, carte Google intégrée, points d'intérêt et plusieurs sites de plage présentés côté interface.
- Authentification JWT avec rôles `ROLE_CLIENT` et `ROLE_CONCESSIONNAIRE`.
- Réservation de parasols sur la saison du 1er mai au 15 septembre.
- Choix du mobilier sous le parasol, avec supplément tarifaire selon l'équipement.
- Contrôle des disponibilités, gestion des conflits et verrouillage pessimiste lors de la création d'une réservation.
- Calcul tarifaire côté backend, paiement simulé et facture PDF téléchargeable après paiement.
- Espace client pour suivre les réservations et retrouver les factures.
- Espace concessionnaire avec planning visuel, file de demandes, validation/refus et suivi client.
- Interface responsive avec thème clair/sombre, header et footer structurés comme une application publique.

## Lancement avec Docker

Créer un fichier `.env` à la racine :

```env
POSTGRES_DB=bagni_plage
POSTGRES_USER=bagni
POSTGRES_PASSWORD=change_me
JWT_SECRET=replace_with_a_long_random_secret_of_at_least_32_chars
CORS_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

Puis lancer :

```bash
docker compose up --build
```

Services :

- Frontend : `http://localhost:4200`
- Backend : `http://localhost:8080`
- Swagger UI : `http://localhost:8080/swagger-ui.html`

## Lancement local

Backend :

```bash
cd backend
./mvnw spring-boot:run
```

Frontend :

```bash
cd frontend
npm ci
npm start
```

## Compte concessionnaire

Un compte concessionnaire est créé par les migrations pour l'environnement local :

```text
Email: admin@bagni-plage.it
Mot de passe: Admin1234!
```

Ce compte permet d'accéder au planning, aux demandes en attente et aux informations client.

## Tests et qualité

Backend :

```bash
cd backend
./mvnw test
```

Frontend :

```bash
cd frontend
npm run lint
npm test
npm run build
```

Une CI GitHub Actions exécute les tests backend, le lint frontend, les tests frontend et le build Angular.

## Points techniques à mettre en avant

- Architecture REST claire avec DTOs, services métier et validations côté backend.
- Sécurité Spring Security + JWT.
- Migrations Flyway et données initiales.
- Gestion de disponibilité avec verrouillage pessimiste.
- Génération de facture PDF côté backend.
- Angular standalone components, lazy loading, signals et formulaires réactifs.
- Dockerisation complète et proxy Nginx.

## État multi-sites

La page d'accueil présente déjà plusieurs sites de plage pour donner l'expérience produit attendue. Côté backend, la réservation reste pour l'instant rattachée au plan de parasols existant.

Les prochaines étapes prévues sont :

- Modéliser les sites de plage côté backend (`BeachSite`, zones, coordonnées, horaires, tarifs).
- Relier chaque site à ses parasols, sa carte, ses points d'intérêt et ses règles de saison.
- Ajouter un vrai module de paiement sandbox, puis les statuts de transaction associés.
- Générer un billet ou QR code d'arrivée pour le contrôle sur place.
- Préparer le packaging Android APK avec Capacitor une fois l'application web stabilisée.
- Étudier un packaging Windows avec Electron ou Tauri si une version bureau est nécessaire.

## Auteur

Renaud Meynadier.
