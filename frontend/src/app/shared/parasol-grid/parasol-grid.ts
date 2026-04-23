import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FilePlageDetail } from '../../core/models/parasol.model';

export type ParasolStatus = 'free' | 'booked' | 'pending' | 'maintenance' | 'selected';

export interface GridParasol {
  id: number;
  identifiant: string;
  row: number; // file number (1-8, 1 = closest to sea)
  col: number; // position in file (1-36)
  status: ParasolStatus;
  prixJournalier: number;
}

@Component({
  selector: 'app-parasol-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './parasol-grid.html',
  styleUrl: './parasol-grid.scss',
})
export class ParasolGridComponent {
  readonly files = input<FilePlageDetail[]>([]);
  readonly selectedIds = input<number[]>([]);
  readonly highlightIds = input<number[]>([]);
  readonly disponibleIds = input<Set<number>>(new Set());
  readonly mode = input<'client' | 'manager'>('client');
  readonly selectable = input(true);

  readonly parasol = output<GridParasol>();

  @ViewChild('gridContainer', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  zoom = signal(1);
  pan = signal({ x: 0, y: 0 });
  hover = signal<string | null>(null);
  tooltipPos = signal({ x: 0, y: 0 });

  private dragging = false;
  private dragStart = { x: 0, y: 0, px: 0, py: 0 };

  // Grid constants
  readonly CELL = 26;
  readonly GAP = 4;
  readonly AISLE_AT = 18;
  readonly AISLE = 30;
  readonly TOTAL_ROWS = 8;
  readonly TOTAL_COLS = 36;

  readonly gridParasols = computed((): GridParasol[] => {
    const result: GridParasol[] = [];
    for (const file of this.files()) {
      for (const p of file.parasols) {
        const isDisponible = this.disponibleIds().size === 0 || this.disponibleIds().has(p.id);
        let status: ParasolStatus = isDisponible ? 'free' : 'booked';
        if (this.selectedIds().includes(p.id)) status = 'selected';
        result.push({
          id: p.id,
          identifiant: p.identifiant,
          row: p.numeroFile,
          col: p.numeroEmplacement,
          status,
          prixJournalier: file.prixJournalier,
        });
      }
    }
    return result;
  });

  readonly wrapperW = computed(
    () => this.TOTAL_COLS * this.CELL + (this.TOTAL_COLS - 1) * this.GAP + this.AISLE,
  );
  readonly wrapperH = computed(
    () => this.TOTAL_ROWS * this.CELL + (this.TOTAL_ROWS - 1) * this.GAP + 32,
  );

  xFor(col: number): number {
    const base = (col - 1) * (this.CELL + this.GAP);
    return col > this.AISLE_AT ? base + this.AISLE : base;
  }

  yFor(row: number): number {
    return (row - 1) * (this.CELL + this.GAP);
  }

  aisleX(): number {
    return this.xFor(this.AISLE_AT) + this.CELL + this.GAP / 2;
  }

  rowLabels(): number[] {
    return Array.from({ length: this.TOTAL_ROWS }, (_, i) => i + 1);
  }

  isHovered(identifiant: string): boolean {
    return this.hover() === identifiant;
  }

  parasolColor(p: GridParasol): string {
    if (p.status === 'selected') return 'var(--primary)';
    const hIds = this.highlightIds();
    if (hIds.length > 0 && hIds.includes(p.id)) return 'var(--accent)';
    if (p.status === 'free') return 'var(--mint)';
    if (p.status === 'pending') return 'var(--accent)';
    if (p.status === 'maintenance') return 'rgba(43,29,19,.15)';
    return 'rgba(43,29,19,.25)';
  }

  parasolBoxShadow(p: GridParasol): string {
    if (p.status === 'selected')
      return `0 0 0 2.5px var(--primary-dark), 0 0 0 5px rgba(200,85,61,.25), 0 4px 12px rgba(200,85,61,.45)`;
    if (this.isHovered(p.identifiant)) return `0 0 0 2px var(--ink), 0 4px 10px rgba(0,0,0,.2)`;
    return `0 1.5px 0 rgba(43,29,19,.2)`;
  }

  parasolTransform(p: GridParasol): string {
    if (p.status === 'selected') return 'scale(1.1)';
    if (this.isHovered(p.identifiant)) return 'scale(1.25)';
    return 'scale(1)';
  }

  isDisabled(p: GridParasol): boolean {
    if (!this.selectable()) return true;
    if (this.mode() === 'manager') return false;
    return p.status === 'booked' || p.status === 'maintenance' || p.status === 'pending';
  }

  onParasolClick(p: GridParasol): void {
    if (this.isDisabled(p)) return;
    this.parasol.emit(p);
  }

  onParasolEnter(p: GridParasol, event: MouseEvent): void {
    this.hover.set(p.identifiant);
    const container = this.containerRef.nativeElement.getBoundingClientRect();
    const target = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.tooltipPos.set({
      x: target.left - container.left + target.width / 2,
      y: target.top - container.top,
    });
  }

  onWheel(event: WheelEvent): void {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    this.zoom.update(z => Math.min(2.2, Math.max(0.6, z * Math.exp(-event.deltaY * 0.002))));
  }

  onMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('[data-parasol]')) return;
    this.dragging = true;
    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
      px: this.pan().x,
      py: this.pan().y,
    };
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.dragging) return;
    this.pan.set({
      x: this.dragStart.px + (event.clientX - this.dragStart.x),
      y: this.dragStart.py + (event.clientY - this.dragStart.y),
    });
  }

  onMouseUp(): void {
    this.dragging = false;
  }

  zoomIn(): void {
    this.zoom.update(z => Math.min(2.2, z * 1.2));
  }
  zoomOut(): void {
    this.zoom.update(z => Math.max(0.6, z / 1.2));
  }
  zoomReset(): void {
    this.zoom.set(1);
    this.pan.set({ x: 0, y: 0 });
  }

  statusLabel(s: ParasolStatus): string {
    return {
      free: 'Libre',
      booked: 'Réservé',
      pending: 'En attente',
      maintenance: 'Maintenance',
      selected: 'Sélectionné',
    }[s];
  }

  getTransform(): string {
    const p = this.pan();
    return `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px + 12px)) scale(${this.zoom()})`;
  }

  getHoveredParasol(): GridParasol | null {
    const id = this.hover();
    return id ? (this.gridParasols().find(p => p.identifiant === id) ?? null) : null;
  }
}
