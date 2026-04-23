import { Pays } from './pays.model';

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  pays: Pays;
  dateInscription: string;
}

export interface ClientUpdateRequest {
  nom: string;
  prenom: string;
  email: string;
  paysId: number;
}
