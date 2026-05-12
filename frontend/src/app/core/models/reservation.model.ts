import { Pays } from './pays.model';

export type Statut = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';

export type Equipement =
  | 'UN_LIT'
  | 'DEUX_LITS'
  | 'UN_FAUTEUIL'
  | 'FAUTEUIL_ET_LIT'
  | 'DEUX_FAUTEUILS';

export interface ClientInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  pays: Pays;
  dateInscription: string;
}

export interface ParasolInfo {
  id: number;
  numeroEmplacement: number;
  numeroFile: number;
  identifiant: string;
}

export interface Reservation {
  id: number;
  client: ClientInfo;
  parasols: ParasolInfo[];
  equipement: Equipement;
  dateDebut: string;
  dateFin: string;
  montantPaye: number;
  statut: Statut;
  remarques?: string;
  dateTraitement?: string;
  motifRefus?: string;
  paiementReference?: string;
  paiementStatut?: string;
  remboursementReference?: string;
  remboursementStatut?: string;
  ticketCode?: string;
  ticketStatut?: string;
  ticketEmisLe?: string;
  ticketUtiliseLe?: string;
}

export interface ReservationRequest {
  parasolIds: number[];
  equipement: Equipement;
  dateDebut: string;
  dateFin: string;
  remarques?: string;
  clientId?: number;
}

export interface ReservationTicket {
  reservationId: number;
  ticketCode?: string;
  ticketToken?: string;
  statut: 'ACTIF' | 'UTILISE' | 'ANNULE' | 'EXPIRE' | 'EN_ATTENTE_VALIDATION' | string;
  emisLe?: string;
  utiliseLe?: string;
  qrPayload?: string;
  client: string;
  periode: string;
  parasols: string;
  equipement: string;
}
