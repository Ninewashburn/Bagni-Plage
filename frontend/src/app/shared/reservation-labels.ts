import { Equipement, Statut } from '../core/models/reservation.model';

export function equipmentLabel(equipement: Equipement | string): string {
  return (
    (
      {
        UN_LIT: '1 lit inclus',
        DEUX_LITS: '2 lits',
        UN_FAUTEUIL: '1 fauteuil',
        FAUTEUIL_ET_LIT: 'Fauteuil + lit',
        DEUX_FAUTEUILS: '2 fauteuils',
      } as Record<string, string>
    )[equipement] ?? equipement
  );
}

export function reservationStatusLabel(statut: Statut | string): string {
  return (
    (
      {
        EN_ATTENTE: 'En attente',
        VALIDEE: 'Validée',
        REFUSEE: 'Refusée',
      } as Record<string, string>
    )[statut] ?? statut.replaceAll('_', ' ').toLowerCase()
  );
}

export function ticketStatusLabel(statut: string): string {
  return (
    (
      {
        ACTIF: 'Prêt à présenter',
        UTILISE: 'Déjà utilisé',
        ANNULE: 'Annulé',
        EXPIRE: 'Expiré',
        EN_ATTENTE_VALIDATION: 'En attente de validation',
      } as Record<string, string>
    )[statut] ?? statut.replaceAll('_', ' ').toLowerCase()
  );
}
