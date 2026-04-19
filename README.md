# Bagni Plage 🏖️

Application fullstack de gestion de réservations de parasols sur une plage italienne (concession privée). Projet fil rouge CDA RNCP Niveau 6 de Renaud Meynadier, réalisé avec une stack moderne.

[![GitHub](https://img.shields.io/badge/GitHub-Ninewashburn/Bagni--Plage-blue)](https://github.com/Ninewashburn/Bagni-Plage)

## 📋 Description

Bagni Plage est une plateforme de réservation de parasols pour une concession de plage privée. Elle permet aux clients de réserver des emplacements de parasol avec équipements (lits, fauteuils) et aux concessionnaires de gérer les réservations, clients et planning visuel.

**Domaine métier :**
- Concession avec 8 files de parasols (1 = bord mer, tarif le plus élevé)
- Chaque file contient 36 parasols (identifiés par numéro + file, ex: 15F4)
- Saison estivale : 1er juin au 15 septembre
- Équipements : 1 lit, 2 lits, 1 fauteuil, fauteuil + lit, 2 fauteuils
- Calcul tarif : nombre jours, fidélité client, proximité mer, liens de parenté (-50% frères/sœurs, -25% cousins)

**Business Case :** Voir [CLAUDE.md](CLAUDE.md) pour les spécifications complètes.

## 🛠️ Stack Technique

| Couche       | Technologie                                           |
|--------------|-------------------------------------------------------|
| **Backend**  | Java 21 + Spring Boot 3.5.13 + Maven                  |
| **Sécurité** | Spring Security + JWT (JJWT)                          |
| **Persistance** | Spring Data JPA + Hibernate + PostgreSQL              |
| **Migrations** | Flyway                                                |
| **Doc API**  | SpringDoc OpenAPI (Swagger UI sur /swagger-ui.html)   |
| **Frontend** | Angular 21 + TypeScript strict + Angular Material     |
| **State**    | Signals (Angular 18+) — pas de NgRx                  |
| **Style**    | Angular Material + dark mode natif                   |
| **Paiement** | PayPal SDK sandbox                                    |
| **Infra**    | Docker Compose (PostgreSQL + backend + frontend)      |
| **Tests**    | JUnit 5 + Mockito (backend) + Vitest + Playwright (frontend) |

## 📁 Structure du Projet

```
Bagni-Plage/
├── backend/                  ← Spring Boot (pom.xml ici)
│   └── src/main/java/fr/humanbooster/fx/plages/
│       ├── config/           ← SecurityConfig, CorsConfig, JwtConfig
│       ├── controller/       ← REST controllers
│       ├── dto/              ← Request/Response DTOs
│       ├── entity/           ← Entités JPA
│       ├── exception/        ← GlobalExceptionHandler
│       ├── repository/       ← JpaRepository interfaces
│       ├── security/         ← JwtFilter, JwtService, UserDetailsServiceImpl
│       └── service/          ← Logique métier
├── frontend/                 ← Angular CLI (angular.json ici)
│   └── src/app/
│       ├── core/             ← Services singleton, guards, interceptors, JWT
│       ├── shared/           ← Composants/pipes réutilisables
│       ├── features/
│       │   ├── auth/         ← Login, register (client + concessionnaire)
│       │   ├── planning/     ← Grille parasols (feature la plus complexe)
│       │   ├── reservations/ ← Liste + détail + formulaire
│       │   ├── clients/      ← Gestion clients (concessionnaire)
│       │   └── profil/       ← Modification infos client
│       └── layout/           ← Header, sidebar, footer
├── docker-compose.yml        ← Lance PostgreSQL + backend + frontend
├── CLAUDE.md                 ← Spécifications business case
└── README.md                 ← Ce fichier
```

## 🚀 Installation et Lancement

### Prérequis
- Java 21
- Node.js 18+
- Docker & Docker Compose
- Maven 3.9+

### Lancement rapide (Docker)
```bash
# Tout lancer en une commande
docker-compose up --build
```

### Développement local

#### Backend
```bash
cd backend
mvn spring-boot:run
# Backend sur http://localhost:8080
# Swagger UI : http://localhost:8080/swagger-ui.html
```

#### Frontend
```bash
cd frontend
npm install
ng serve
# Frontend sur http://localhost:4200
```

### Tests
```bash
# Backend
cd backend && mvn test

# Frontend
cd frontend && ng test
```

## 🎯 Fonctionnalités

### 👤 Rôle Concessionnaire (Back-office)
- **Authentification** : Email + mot de passe
- **Planning parasols** : Grille occupation (jour/semaine/mois/période custom)
- **Gestion réservations** : Liste complète + filtres, détail, validation/refus (avec remboursement PayPal)
- **Gestion clients** : Liste paginée + filtres, suppression (si aucune réservation validée)
- **Modification parasols** : Drag & drop sur le planning

### 🏖️ Rôle Client (Frontend)
- **Inscription** : Nom, prénom, email, pays, mot de passe (min 8 caractères)
- **Authentification** : Email + mot de passe
- **Réservations** : Liste personnelle (EN_ATTENTE + VALIDEE + REFUSEE)
- **Nouvelle réservation** : Stepper 4 étapes + paiement PayPal sandbox
- **Profil** : Modification des informations personnelles

### ✨ Fonctionnalités Ergonomiques
- **Dark mode** : Toggle persisté en localStorage, activé par défaut
- **Responsive** : Mobile-first, grille planning adaptée au tactile
- **Toast notifications** : Succès/erreur sur chaque action (MatSnackBar)
- **Skeleton loaders** : Pendant les appels API, jamais de page blanche
- **Confirmation dialogs** : Avant toute action destructive
- **Pagination** : Sur toutes les listes
- **Recherche/filtres** : Côté client pour listes courtes, côté API pour grandes
- **Indicateur saison** : Badge visible si date hors saison (1 juin – 15 sept.)
- **Calcul tarif temps réel** : Dans le formulaire de réservation client
- **Breadcrumb** : Navigation contextuelle dans le back-office

## 🔧 Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
POSTGRES_DB=bagni_plage
POSTGRES_USER=bagni
POSTGRES_PASSWORD=bagni_secret
JWT_SECRET=change_this_in_production_min_256_bits
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_MODE=sandbox
```

## 📊 État du Projet

**Complétude : ~30-35%** (selon analyse du code source)

### ✅ Implémenté
- Modèle de données JPA complet
- Services CRUD de base
- Authentification basique
- Composants Angular principaux
- Structure projet respectée

### 🚧 En cours / À implémenter
- Moteur de calcul tarif
- Workflow réservations (validation/refus)
- Intégration PayPal
- Grille planning visuelle
- Migration vers Angular 21 + Signals
- Tests fonctionnels

Voir [CLAUDE.md](CLAUDE.md) pour le détail des spécifications.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est réalisé dans le cadre d'une formation CDA RNCP Niveau 6.

## 👨‍💻 Auteur

**Renaud Meynadier** - Développeur fullstack Angular + Spring Boot

---

*Dernière mise à jour : Avril 2026*
