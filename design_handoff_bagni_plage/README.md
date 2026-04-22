# Handoff: Bagni Plage — Beach Concession Management

## Overview

**Bagni Plage** est une application de gestion de concession de plage italienne (bagno). Elle permet :

- **Aux clients** : s'inscrire, réserver un ou plusieurs parasols pour une période donnée, choisir l'équipement sous le parasol (lits, fauteuils de réalisateur), payer via Paypal, consulter ses réservations.
- **Au concessionnaire** : voir le planning d'occupation (jour/semaine/mois/période), traiter les réservations en attente (valider/refuser avec remboursement Paypal automatique), gérer les clients (filtrage par pays, tri par date d'inscription, suppression conditionnelle), modifier l'allocation des parasols via drag & drop.

Voir le PDF `BusinessCaseCDA2022.pdf` joint pour l'énoncé fonctionnel complet.

## About the Design Files

Les fichiers de ce bundle sont des **références de design réalisées en HTML/React** — des prototypes qui illustrent le rendu et le comportement attendus. Ce **ne sont pas du code de production à copier tel quel**.

La tâche consiste à **recréer ces designs dans la stack cible** (par ex. Symfony/Twig, Laravel, Next.js, NestJS+React, Android natif, Electron…) en utilisant les patterns et bibliothèques établis du projet. Si aucun environnement n'existe encore, choisir la stack la plus adaptée au business case (l'énoncé suggère un back avec framework, une API REST CRUD clients, une app Android et/ou Electron).

Le prototype HTML utilise React 18 + Babel standalone chargés via CDN, avec des styles inline. Cette approche est **uniquement pour prototyper** ; en production, utiliser un vrai bundler, du CSS structuré (CSS Modules, Tailwind, styled-components selon les conventions du projet), et une vraie architecture côté serveur.

## Fidelity

**High-fidelity** — couleurs, typographie, espacements, rayons de bordure, ombres, micro-animations et copywriting sont finaux et doivent être reproduits fidèlement.

## Direction artistique

**Rivière italienne rétro** — inspiration bagni italiens des années 60 :
- Rayures cabana (répétition linéaire terracotta/crème)
- Typographies serif éditoriales (DM Serif Display pour les titres, Cormorant Garamond italique pour les accents)
- Work Sans pour l'UI courante
- Tampons décoratifs (stamps) en bordure de reçus et confirmations
- Accents de copy en italien ("il mare", "ricevuta", "grazie", "Estate 2026")
- Dark mode disponible

## Design Tokens

### Palettes (3 variantes, définies dans `theme.jsx` → `BAGNI_PALETTES`)

**Terracotta (défaut)**
| Token | Value | Usage |
|---|---|---|
| cream | `#F4E9D8` | Fond principal clair |
| creamDark | `#EBDDC5` | Fond alt |
| paper | `#FBF5E9` | Fond sur fond coloré (texte sur primary) |
| ink | `#2B1D13` | Texte principal, boutons `ink` |
| inkSoft | `#5A4432` | Texte secondaire |
| sea | `#3E7D8C` | Mer (arrière-plan) |
| seaDeep | `#2A5968` | Mer profonde |
| primary | `#C8553D` | Terracotta — CTA, sélection |
| primaryDark | `#A23E2B` | Hover primary |
| accent | `#E9A24B` | Ocre — highlights, attente |
| sand | `#D9C39A` | Sable |
| mint | `#7AA68A` | Validation, disponible |
| stripe | `#C8553D` | Couleur de rayure cabana |

**Saltwater** (primary `#0E8A9E`, ink `#0F2A33`) — bleu sarcelle méditerranéen
**Limone** (primary `#E8A93C`, ink `#28321A`, stripe `#3E6E45`) — jaune citron + vert olive

**Dark mode** (dérivé automatiquement) :
- bg `#17120D`, bgElev `#211910`, bgCard `#261D13`
- ink `#F4E9D8`, inkSoft `#D9C8AE`, inkFaint `#8F7B5F`
- borders `rgba(244,233,216,.13 / .27)`
- Les `primary`, `accent`, `sea`, `mint` sont gardés de la palette active.

### Typography

| Token | Family | Google Font |
|---|---|---|
| display | `"DM Serif Display", Georgia, serif` | DM Serif Display (0,1 italic) |
| serif | `"Cormorant Garamond", Georgia, serif` | Cormorant Garamond (400/500/600 + italic) |
| sans | `"Work Sans", system-ui, sans-serif` | Work Sans (400/500/600/700) |
| mono | `"JetBrains Mono", ui-monospace` | JetBrains Mono (400/500) |

Règles d'usage :
- **display** → titres (large titles, nom de réservation)
- **serif italic** → légendes, libellés décoratifs, citations, tampons
- **sans** → UI générale, boutons, form fields, stats
- **mono** → références techniques (ID réservation `R-2826`)

Échelle de taille : 11 / 12 / 13 / 14 / 15 / 16 / 17 / 18 / 20 / 22 / 26 / 28 / 30 / 34 / 38 / 44 px.

### Spacing / Radii / Shadows

- Rayons : `10, 12, 14, 16, 18, 20, 24, 26` px pour cards ; `999` pour pills/boutons ; `50%` pour avatars et parasols.
- Shadows :
  - Card lift: `0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)`
  - Elevated panel: `0 12px 40px rgba(0,0,0,.12)`
  - Device: `0 40px 100px rgba(0,0,0,.18)`
- Borders : `1px` solid avec alpha ink 18-30%, ou `1.5px dashed` (ink 30%) pour les reçus.
- Rayures cabana : `repeating-linear-gradient(90deg, color1 0 18px, color2 18px 36px)` — largeur ajustable de 6 à 18px selon le composant.

## Architecture des écrans

Le prototype a **un role switch** en haut de l'écran (client mobile / concessionnaire desktop). En production, il s'agit de deux expériences distinctes :

### Partie CLIENT (mobile-first, iOS-framed dans le proto)

Viewport cible : 402 × 874 (iPhone 14 Pro). Responsive web ou PWA.

1. **Accueil** — Hero avec fond illustré (mer + parasols + vagues SVG), salutation "Buongiorno, Marcella", 2 CTA cards (Nouvelle réservation / Mes réservations), 2 info cards (prix première file, pourcentage fidélité).

2. **Sélection des parasols** — La grille 8 files × 36 parasols avec allée centrale entre la colonne 18 et 19. Les parasols sont des cercles (26px compact / 18px mobile) avec un pt central. Statuts :
   - `free` → mint
   - `booked` → ink @ 30%
   - `pending` → accent (ocre)
   - `maintenance` → ink @ 15%
   - `selected` → primary + ring + label flottant
   - Hover : scale 1.25, shadow, tooltip noir avec ID + file + prix/statut.
   - Zoom (wheel + ctrl, boutons +/−/⌾ en bas à droite), pan par drag.
   - Légende en bas gauche (pill en verre translucide).
   - Header "~ ~ ~ il mare ~ ~ ~" en haut, labels de file "1ᶠ…8ᶠ" à gauche.
   - Date range bar au-dessus ; CTA continuer (full width, primary) en bas avec récap sélection + prix brut.

3. **Équipement & tarif** — 5 options (1 lit, 2 lits, 1 fauteuil, 1 fauteuil + 1 lit, 2 fauteuils) sous forme de radio cards. Sélecteur de lien avec le gérant (aucun / cousin −25% / frère-sœur −50%). **Reçu (ricevuta)** avec bordure dashed, ligne subtotal, lignes discount (en mint, préfixe `−€`), total en serif 30px primary, tampon décoratif rotatif en coin ("CONCESSIONE ESTATE '26"). CTA Paypal en bas.

4. **Paypal sandbox** — Fond bleu `#003087` avec header discret, modal blanc 20px border-radius top, logo Pay*Pal* custom (italic, #003087 / #009cde), tag SANDBOX, montant en 44px, mock solde, bouton jaune Paypal `#ffc439`.

5. **Confirmation** — Success screen avec cercle rayé cabana + check mint, stamp "CONFIRMED €X" rotatif, titre "Grazie, Marcella", copy italique rassurante, CTA "Voir mes réservations".

6. **Mes réservations** — Liste de cards avec barre cabana en haut, tag status (pending / accepted / past / refused), dates, équipement, prix. Stamp "Al prossimo anno!" en bas de liste pour remplir l'empty tail.

### Partie CONCESSIONNAIRE (desktop, 1440×900 dans le proto)

Layout : sidebar 220px + main flex. Mac window chrome pour le proto.

1. **Sidebar** : logo wordmark, nav (Planning / Réservations +badge / Clients), profil en bas.

2. **Header** : 68px, section label italique + titre display + search 240px (`⌘K` hint) + bell button avec dot.

3. **Planning** (vue par défaut) — Split 320px queue / main :
   - **Queue gauche** : tag "3 à traiter", liste de pending avec avatar coloré, nom, prix, parasols, dates, pays, ID. Item selected = bordure primary.
   - **Main** : toolbar avec toggle jour/semaine/mois/période (pill-segmented, ink actif), date range, stats à droite (187 occupés / 68% taux / €4 280 jour).
   - **Grille** des parasols partagée avec le client, mais en mode `manager` : les parasols de la résa sélectionnée sont highlightés en accent.
   - **Panel flottant** droite 300px : avatar + nom + pays + ancienneté, rows détail (parasols, dates, équipement, lien parenté), total en primary 22px, boutons Refuser (danger) + Valider (ink avec check), note italique "glisser-déposer pour modifier".

4. **Réservations** — Filtres pills (Toutes / À traiter / Validées / Refusées), table avec colonnes : Ref (mono) / Client (avatar + nom + flag) / Parasols / Dates / Équipement / Montant (display) / Actions (icônes X rouge et ✓ mint 30px pour pending, tag sinon).

5. **Clients** — Filtres pays (pills), tri par date d'inscription (affiché au droite), grille de cards `repeat(auto-fill, minmax(240px, 1fr))` avec barre cabana, avatar 44px, nom display, "Client depuis X", 3 stats (Années / Réservations / Fidélité en mint).

### Notifications

Toast bottom-right, fond ink, radius 16, animation `slideup .35s cubic-bezier(.2,.7,.3,1)`. Contient cercle 36px (mint pour accept, primary pour refuse), titre display "Réservation R-2826 validée", sous-titre "Client notifié" ou "Remboursement Paypal déclenché pour X", bouton close. Auto-dismiss 3.2s.

## Interactions & Behavior

- **Grille zoomable** : wheel + ctrl/meta zoom (0.6× à 2.2×) ; drag sur fond pour pan ; click parasol toggle la sélection (si `free`) ; hover parasol → tooltip avec position fixe au-dessus.
- **Role switch** : persiste en localStorage (`bagni-tweaks`), synchronisé avec l'edit mode host via postMessage.
- **Tweaks panel** : palette swatches (3), toggle clair/sombre. Sauvegarde `{ palette, dark, role }` en localStorage et propage aux `ThemeProvider`.
- **Validation / refus réservation** : déclenche un toast immédiat ; en prod, appel backend + (pour refus) appel Paypal sandbox pour refund.
- **Empty states** : stamp décoratif "Al prossimo anno!" en fin de liste ; à étendre pour la recherche vide, liste clients vide, etc.
- **Micro-animations** : parasol scale 1.25 au hover, sélection scale 1.1 + ring double ; boutons translateY(-1px) au hover ; toast slideup ; transitions 150ms `.

## Computed pricing (règles métier)

Fonction `computePrice({ days, rows, years, kinship, equipment })` dans `data.jsx`. Règles :

1. Prix de base par file (colonne la plus proche de la mer = plus cher) : `[55, 48, 42, 36, 32, 28, 25, 22]` € / jour pour les files 1→8.
2. Supplément équipement (par jour) : `bed1: 0, bed2: 12, chair1: 0, chairbed: 8, chair2: 6` €.
3. `subtotal = Σ (basePrice(row) + equipmentSupp) × days` sur tous les parasols.
4. `loyaltyDisc = min(15%, years × 3%)` — 3% par année d'ancienneté, plafonné à 15%.
5. `kinship` : `none: 0`, `cousin: 25%`, `sibling: 50%`.
6. `total = subtotal × (1 − loyaltyDisc) × (1 − kinDisc)` (cascadé, pas additionné).

## State Management

Tout en local React dans le proto. En prod, suggérer :
- Auth : JWT ou session (le business case demande email + mot de passe ≥ 8 char).
- Réservations : store paginé, filtres persistants (pour manager).
- Grille : état sélection + tweak date range.
- i18n possible (FR/IT/EN minimum compte tenu de la clientèle).

## Composants à recréer

Voir les fichiers JSX joints pour des implémentations de référence :

| Fichier | Contenu |
|---|---|
| `theme.jsx` | Palettes, `ThemeProvider`, hook `useColors`, helper `cabanaStripes(c1, c2, width)` |
| `data.jsx` | Modèle de données mock (parasols, réservations, clients), `computePrice`, `KINSHIPS` |
| `ui.jsx` | `BagniLogo`, `BagniWordmark`, `Button`, `Tag`, `Avatar`, `Stamp`, `BeachBackdrop`, lib `Icon` |
| `parasol-grid.jsx` | **Le composant clé** : grille zoom/pan, `Parasol`, légende, tooltip |
| `client-mobile.jsx` | Tous les écrans client (Home, Grid, Equip, Pay, Success, Mine) |
| `manager-desktop.jsx` | Dashboard concessionnaire (Planning, Reservations, Clients, Toast) |
| `Bagni Plage.html` | Shell du prototype, role switch, Tweaks panel |

## Assets

Aucun asset externe — tout est SVG inline ou CSS (rayures cabana, backdrops illustrés, icônes). Si le projet a besoin de vraies photos de concession, les ajouter en `<img>` aux endroits prévus (hero Home client notamment).

Polices : **Google Fonts** uniquement (DM Serif Display, Cormorant Garamond, Work Sans, JetBrains Mono).

## Énoncé fonctionnel

Voir `BusinessCaseCDA2022.pdf` pour les besoins fonctionnels complets (auth, CRUD clients avec conditions de suppression, paiement Paypal sandbox, planning jour/semaine/mois/période, drag & drop, filtres pays / tri date inscription, API REST, tests unitaires + intégration, app Android et/ou Electron).

## Files

```
design_handoff_bagni_plage/
├── README.md                  ← ce document
├── BusinessCaseCDA2022.pdf    ← énoncé original
├── Bagni Plage.html           ← shell + role switch + tweaks
├── theme.jsx                  ← tokens + palettes + dark mode
├── data.jsx                   ← modèle + règles de pricing
├── ui.jsx                     ← composants atomiques
├── parasol-grid.jsx           ← feature hero
├── client-mobile.jsx          ← écrans client
└── manager-desktop.jsx        ← écrans concessionnaire
```

Ouvrir `Bagni Plage.html` dans un navigateur (via un serveur local — les `<script src="...jsx">` ne se chargent pas en `file://`) pour voir les designs interactifs en live.
