import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { API_BASE_URL } from '../api-url';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly ROLE_KEY = 'user_role';
  private readonly NOM_KEY = 'user_nom';
  private readonly PRENOM_KEY = 'user_prenom';
  private readonly EMAIL_KEY = 'user_email';

  private http = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _role = signal<string | null>(localStorage.getItem(this.ROLE_KEY));
  private _nom = signal<string | null>(localStorage.getItem(this.NOM_KEY));
  private _prenom = signal<string | null>(localStorage.getItem(this.PRENOM_KEY));
  private _email = signal<string | null>(localStorage.getItem(this.EMAIL_KEY));

  readonly isAuthenticated = computed(() => {
    const token = this._token();
    return !!token && !this.isJwtExpired(token);
  });
  readonly token = computed(() => this._token());
  readonly role = computed(() => this._role());
  readonly nom = computed(() => this._nom());
  readonly prenom = computed(() => this._prenom());
  readonly email = computed(() => this._email());
  readonly fullName = computed(() => `${this._prenom()} ${this._nom()}`);
  readonly isConcessionnaire = computed(() => this._role() === 'ROLE_CONCESSIONNAIRE');

  constructor() {
    const token = this._token();
    if (token && this.isJwtExpired(token)) {
      this.clearSession();
    }
  }

  storeSession(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.ROLE_KEY, response.role);
    localStorage.setItem(this.NOM_KEY, response.nom);
    localStorage.setItem(this.PRENOM_KEY, response.prenom);
    localStorage.setItem(this.EMAIL_KEY, response.email);
    this._token.set(response.token);
    this._role.set(response.role);
    this._nom.set(response.nom);
    this._prenom.set(response.prenom);
    this._email.set(response.email);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(tap(response => this.storeSession(response)));
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/register`, request)
      .pipe(tap(response => this.storeSession(response)));
  }

  updateIdentity(response: LoginResponse): void {
    this.storeSession(response);
  }

  clearSession(): void {
    [this.TOKEN_KEY, this.ROLE_KEY, this.NOM_KEY, this.PRENOM_KEY, this.EMAIL_KEY].forEach(k =>
      localStorage.removeItem(k),
    );
    this._token.set(null);
    this._role.set(null);
    this._nom.set(null);
    this._prenom.set(null);
    this._email.set(null);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private isJwtExpired(token: string): boolean {
    try {
      const [, payload] = token.split('.');
      if (!payload) return true;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(normalized)) as { exp?: number };
      return typeof decoded.exp === 'number' && decoded.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
