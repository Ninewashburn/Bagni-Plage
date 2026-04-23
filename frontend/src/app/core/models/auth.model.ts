export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'ROLE_CLIENT' | 'ROLE_CONCESSIONNAIRE';
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  paysId: number;
}
