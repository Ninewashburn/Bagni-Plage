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
}

export interface ReservationRequest {
  parasolIds: number[];
  equipement: Equipement;
  dateDebut: string;
  dateFin: string;
  montantPaye: number;
  remarques?: string;
}
