import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QR_CELLS } from '../../shared/bagni-catalog';

@Component({
  selector: 'app-ma-journee',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './ma-journee.html',
})
export class MaJourneeComponent {
  protected readonly qrCells = QR_CELLS;
  protected readonly timeline = [
    { time: '10h00', label: 'Arrivée possible à la plage' },
    { time: '10h15', label: 'Contrôle du QR Pass et installation' },
    { time: '12h30', label: 'Restaurant recommandé à proximité' },
    { time: '14h00', label: 'Activité paddle selon météo' },
    { time: '18h00', label: 'Fin du créneau de journée' },
  ];
}
