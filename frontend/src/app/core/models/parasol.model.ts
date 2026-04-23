export interface FilePlageDetail {
  id: number;
  numero: number;
  prixJournalier: number;
  parasols: ParasolDetail[];
}

export interface ParasolDetail {
  id: number;
  numeroEmplacement: number;
  numeroFile: number;
  identifiant: string;
}
