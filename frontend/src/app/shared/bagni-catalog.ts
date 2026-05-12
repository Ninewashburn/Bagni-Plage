export interface BeachSite {
  slug: string;
  name: string;
  location: string;
  city: string;
  mood: string;
  longDescription: string;
  season: string;
  price: string;
  availability: string;
  imageClass: string;
  badges: string[];
  highlights: string[];
  scores: Array<{ label: string; value: string }>;
}

export interface GuidePlace {
  name: string;
  type: string;
  category?: string;
  siteSlug?: string;
  distance: string;
  walk: string;
  description: string;
  tag: string;
}

export interface BagniOffer {
  name: string;
  price: string;
  description: string;
  badge: string;
  includes: string[];
  recommended?: boolean;
  credits?: string;
  discount?: string;
}

export const BEACH_SITES: BeachSite[] = [
  {
    slug: 'mediterranee',
    name: 'Bagni Plage Méditerranée',
    location: 'Le Grau-du-Roi, Camargue',
    city: 'Le Grau-du-Roi',
    mood: 'Grande plage familiale, restaurants proches et promenades en front de mer.',
    longDescription:
      'Une plage pensée pour les journées simples et complètes : accès facile, restaurants à pied, activités nautiques et emplacements premium proches de la mer.',
    season: 'Mai à septembre',
    price: 'Dès 40 EUR / jour',
    availability: '288 parasols',
    imageClass: 'is-mediterranee',
    badges: ['Famille', 'Restaurants à pied', 'Parking à 8 min'],
    highlights: ['Parking à 8 min', 'Restaurants à pied', 'Activités nautiques'],
    scores: [
      { label: 'Calme', value: '3/5' },
      { label: 'Famille', value: '5/5' },
      { label: 'Activités', value: '4/5' },
      { label: 'Premium', value: '4/5' },
    ],
  },
  {
    slug: 'pinede',
    name: 'Bagni Pinède',
    location: "Antibes, Côte d'Azur",
    city: 'Antibes',
    mood: 'Ambiance calme, pins parasols, criques et coucher de soleil.',
    longDescription:
      'Une adresse plus confidentielle, avec des zones premium, une atmosphère paisible et des recommandations locales pour prolonger la journée.',
    season: 'Juin à septembre',
    price: 'Dès 52 EUR / jour',
    availability: '96 parasols',
    imageClass: 'is-pinede',
    badges: ['Premium', 'Calme', 'Vue baie'],
    highlights: ['Zone premium', 'Paddle matinal', 'Vue baie'],
    scores: [
      { label: 'Calme', value: '5/5' },
      { label: 'Famille', value: '3/5' },
      { label: 'Activités', value: '3/5' },
      { label: 'Premium', value: '5/5' },
    ],
  },
  {
    slug: 'atlantique',
    name: 'Bagni Atlantique',
    location: 'La Rochelle, Les Minimes',
    city: 'La Rochelle',
    mood: 'Séjour iodé, grandes marées, marché local et pistes cyclables.',
    longDescription:
      "Une plage ouverte sur les balades, les arrivées à vélo et les journées plus sportives, avec un prix d'entrée plus accessible.",
    season: 'Mai à août',
    price: 'Dès 35 EUR / jour',
    availability: '144 parasols',
    imageClass: 'is-atlantique',
    badges: ['Accès vélo', 'Marché local', 'Balades portuaires'],
    highlights: ['Accès vélo', 'Marché local', 'Balades portuaires'],
    scores: [
      { label: 'Calme', value: '4/5' },
      { label: 'Famille', value: '4/5' },
      { label: 'Activités', value: '5/5' },
      { label: 'Premium', value: '3/5' },
    ],
  },
];

export const GUIDE_PLACES: GuidePlace[] = [
  {
    name: 'Port des Voiles',
    type: 'Promenade',
    category: 'Promenades',
    siteSlug: 'mediterranee',
    distance: '450 m',
    walk: '6 min',
    description: 'Balade de fin de journée entre bateaux, glaciers et terrasses en front de mer.',
    tag: 'Vue mer',
  },
  {
    name: 'Mercato del Sole',
    type: 'Marché local',
    category: 'Marchés',
    siteSlug: 'mediterranee',
    distance: '700 m',
    walk: '9 min',
    description:
      "Produits frais, focaccia, fruits d'été et paniers pique-nique à emporter sous le parasol.",
    tag: 'Matin',
  },
  {
    name: 'La Cabane Azzurra',
    type: 'Restaurant',
    category: 'Restaurants',
    siteSlug: 'mediterranee',
    distance: '280 m',
    walk: '4 min',
    description: 'Cuisine simple de plage : poisson grillé, salades, jus frais et menu enfant.',
    tag: 'Famille',
  },
  {
    name: 'Base Paddle Bagni',
    type: 'Activité',
    category: 'Activités nautiques',
    siteSlug: 'pinede',
    distance: '350 m',
    walk: '5 min',
    description: 'Location de paddles et initiation douce le matin quand la mer est calme.',
    tag: 'Sport',
  },
  {
    name: 'Parking Pineta',
    type: 'Parking',
    category: 'Parkings',
    siteSlug: 'pinede',
    distance: '600 m',
    walk: '8 min',
    description: 'Parking ombragé, pratique pour arriver tôt et rejoindre la plage à pied.',
    tag: 'Pratique',
  },
  {
    name: 'Belvédère della Costa',
    type: 'Point de vue',
    category: 'Points de vue',
    siteSlug: 'atlantique',
    distance: '1,2 km',
    walk: '16 min',
    description: 'Petit détour pour voir la côte, idéal avant le dîner ou après la baignade.',
    tag: 'Photo',
  },
];

export const BAGNI_OFFERS: BagniOffer[] = [
  {
    name: 'Bagni Day',
    price: 'À partir de 40 EUR',
    badge: 'Journée',
    description: 'Réservation simple pour une journée de plage avec Bagni Pass et facture.',
    includes: ['1 parasol', 'Accès plage', 'Bagni Pass', 'Facture PDF'],
    credits: '1 journée',
    discount: '0 %',
  },
  {
    name: 'Bagni Week-end',
    price: 'À partir de 76 EUR',
    badge: '2 jours',
    description: 'Deux jours consécutifs avec votre emplacement réservé et un tarif réduit.',
    includes: ['2 jours', 'Emplacement suivi', 'Tarif réduit', 'Bagni Pass'],
    recommended: true,
    credits: '2 journées',
    discount: '-5 %',
  },
  {
    name: 'Bagni Famille',
    price: 'À partir de 118 EUR',
    badge: 'Famille',
    description: 'Formule confort avec transats, casier et avantage boisson.',
    includes: ['Parasol famille', 'Transats', 'Casier', 'Réduction boisson'],
    credits: '1 à 3 jours',
    discount: '-8 %',
  },
  {
    name: 'Bagni Saison',
    price: 'Sur demande',
    badge: 'Saison',
    description: 'Accès prioritaire aux réservations et réductions sur les équipements.',
    includes: ['Priorité', 'Réductions', 'Choix anticipé', 'Multi-plages'],
    credits: '10+ journées',
    discount: '-15 %',
  },
  {
    name: 'Bagni Premium',
    price: 'À partir de 68 EUR',
    badge: 'Premium',
    description: 'Zones front de mer, conditions plus flexibles et services confort.',
    includes: ['Front de mer', 'Annulation souple', 'Emplacement prioritaire', 'Confort'],
    credits: '1 journée',
    discount: '-',
  },
  {
    name: 'Bagni Liberté',
    price: 'À partir de 180 EUR',
    badge: 'Crédits',
    description: 'Pack de crédits utilisables sur plusieurs plages pendant la saison.',
    includes: ['5 journées', 'Multi-plages', 'Bagni Pass', 'Factures groupées'],
    credits: '5 journées',
    discount: '-10 %',
  },
];

export const QR_CELLS = [
  true,
  true,
  true,
  false,
  true,
  false,
  true,
  true,
  true,
  true,
  false,
  false,
  false,
  true,
  false,
  true,
  false,
  false,
  true,
  false,
  true,
  true,
  false,
  true,
  false,
  false,
  true,
  true,
  false,
  true,
  true,
  false,
  false,
  true,
  false,
  true,
  true,
  true,
  false,
  false,
  true,
  false,
  true,
  false,
  true,
  false,
  true,
  true,
  false,
  false,
  true,
  true,
  false,
  true,
  false,
  false,
  true,
  false,
  true,
  false,
  true,
  true,
  true,
  true,
  false,
  true,
  false,
  true,
  false,
  false,
  true,
  true,
  true,
  false,
  true,
  true,
  false,
  false,
  true,
  false,
  true,
];
