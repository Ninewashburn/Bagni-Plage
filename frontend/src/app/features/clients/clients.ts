import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../../core/services/client.service';
import { PaysService } from '../../core/services/pays.service';
import { Client } from '../../core/models/client.model';
import { Pays } from '../../core/models/pays.model';
import { AvatarComponent } from '../../shared/avatar';

@Component({
  selector: 'app-clients',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    AvatarComponent,
  ],
  templateUrl: './clients.html',
})
export class ClientsComponent implements OnInit {
  private clientService = inject(ClientService);
  private paysService = inject(PaysService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  clients = signal<Client[]>([]);
  pays = signal<Pays[]>([]);
  totalElements = signal(0);
  loading = signal(false);
  selectedPaysId = signal<number | null>(null);

  private currentPage = 0;
  readonly pageSize = 20;

  ngOnInit(): void {
    this.paysService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(p => this.pays.set(p));
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.clientService
      .getAll(this.currentPage, this.pageSize, this.selectedPaysId() ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: page => {
          this.clients.set(page.content);
          this.totalElements.set(page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onPaysFilter(paysId: number | null): void {
    this.selectedPaysId.set(paysId);
    this.currentPage = 0;
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.load();
  }

  supprimer(client: Client): void {
    if (!confirm(`Supprimer ${client.prenom} ${client.nom} ?`)) return;
    this.clientService
      .delete(client.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.clients.update(list => list.filter(c => c.id !== client.id));
          this.totalElements.update(n => n - 1);
          this.snackBar.open('Client supprimé', 'Fermer', { duration: 3000 });
        },
        error: () =>
          this.snackBar.open(
            'Impossible de supprimer ce client (réservations validées existantes)',
            'Fermer',
            { duration: 4000 },
          ),
      });
  }

  initials(c: Client): string {
    return (c.prenom[0] ?? '') + (c.nom[0] ?? '');
  }

  avatarColor(c: Client): string {
    const colors = ['#C8553D', '#3E7D8C', '#E9A24B', '#7AA68A', '#5A4432', '#A23E2B'];
    return colors[c.id % colors.length];
  }
}
