import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface GuidePlace {
  name: string;
  type: string;
  distance: string;
  walk: string;
  description: string;
  tag: string;
}

interface BeachSite {
  name: string;
  location: string;
  mood: string;
  season: string;
  price: string;
  highlights: string[];
}

@Component({
  selector: 'app-guide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './guide.html',
})
export class GuideComponent {
  protected auth = inject(AuthService);

  protected readonly qrCells = [
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

  protected readonly beachSites: BeachSite[] = [
    {
      name: 'Bagni Plage Méditerranée',
      location: 'Le Grau-du-Roi, Camargue',
      mood: 'Grande plage familiale, restaurants proches et promenades en front de mer.',
      season: 'Mai à septembre',
      price: 'Dès 40 € / jour',
      highlights: ['Parking à 8 min', 'Restaurants à pied', 'Activités nautiques'],
    },
    {
      name: 'Bagni Pinède',
      location: 'Antibes, Côte d’Azur',
      mood: 'Ambiance plus calme, pins parasols, criques et coucher de soleil.',
      season: 'Juin à septembre',
      price: 'Dès 52 € / jour',
      highlights: ['Zone premium', 'Paddle matinal', 'Vue baie'],
    },
    {
      name: 'Bagni Atlantique',
      location: 'La Rochelle, Les Minimes',
      mood: 'Séjour iodé, grandes marées, marché local et pistes cyclables.',
      season: 'Mai à août',
      price: 'Dès 35 € / jour',
      highlights: ['Accès vélo', 'Marché local', 'Balades portuaires'],
    },
  ];

  protected readonly places: GuidePlace[] = [
    {
      name: 'Port des Voiles',
      type: 'Promenade',
      distance: '450 m',
      walk: '6 min',
      description:
        'Une balade de fin de journée entre bateaux, glaciers et terrasses en front de mer.',
      tag: 'Vue mer',
    },
    {
      name: 'Mercato del Sole',
      type: 'Marché local',
      distance: '700 m',
      walk: '9 min',
      description:
        'Produits frais, focaccia, fruits d’été et paniers pique-nique à emporter sous le parasol.',
      tag: 'Matin',
    },
    {
      name: 'La Cabane Azzurra',
      type: 'Restaurant',
      distance: '280 m',
      walk: '4 min',
      description: 'Cuisine simple de plage : poisson grillé, salades, jus frais et menu enfant.',
      tag: 'Famille',
    },
    {
      name: 'Base Paddle Bagni',
      type: 'Activité',
      distance: '350 m',
      walk: '5 min',
      description: 'Location de paddles et initiation douce le matin quand la mer est calme.',
      tag: 'Sport',
    },
    {
      name: 'Parking Pineta',
      type: 'Parking',
      distance: '600 m',
      walk: '8 min',
      description: 'Parking ombragé, pratique pour arriver tôt et rejoindre la plage à pied.',
      tag: 'Pratique',
    },
    {
      name: 'Belvédère della Costa',
      type: 'Point de vue',
      distance: '1,2 km',
      walk: '16 min',
      description: 'Un petit détour pour voir la côte, idéal avant le dîner ou après la baignade.',
      tag: 'Photo',
    },
  ];
}
