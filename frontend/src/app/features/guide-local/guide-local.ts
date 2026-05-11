import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GUIDE_PLACES } from '../../shared/bagni-catalog';

@Component({
  selector: 'app-guide-local',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './guide-local.html',
})
export class GuideLocalComponent {
  protected readonly categories = [
    'Restaurants',
    'Parkings',
    'Activités nautiques',
    'Promenades',
    'Marchés',
    'Points de vue',
  ];

  protected readonly places = GUIDE_PLACES;
}
