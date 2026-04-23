import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { LoginResponse } from '../models/auth.model';

@Component({ standalone: true, template: '' })
class DummyComponent {}

const loginRoute = { path: 'login', component: DummyComponent };

const mockResponse: LoginResponse = {
  token: 'tok.abc.xyz',
  role: 'ROLE_CLIENT',
  nom: 'Meynadier',
  prenom: 'Renaud',
  email: 'renaud@example.com',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([loginRoute])],
    });
    service = TestBed.inject(AuthService);
  });

  it('starts unauthenticated when localStorage is empty', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
  });

  it('storeSession populates signals and localStorage', () => {
    service.storeSession(mockResponse);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('tok.abc.xyz');
    expect(service.nom()).toBe('Meynadier');
    expect(service.prenom()).toBe('Renaud');
    expect(service.email()).toBe('renaud@example.com');
    expect(service.fullName()).toBe('Renaud Meynadier');
    expect(localStorage.getItem('jwt_token')).toBe('tok.abc.xyz');
  });

  it('isConcessionnaire returns false for ROLE_CLIENT', () => {
    service.storeSession(mockResponse);
    expect(service.isConcessionnaire()).toBe(false);
  });

  it('isConcessionnaire returns true for ROLE_CONCESSIONNAIRE', () => {
    service.storeSession({ ...mockResponse, role: 'ROLE_CONCESSIONNAIRE' });
    expect(service.isConcessionnaire()).toBe(true);
  });

  it('logout clears signals and localStorage', () => {
    service.storeSession(mockResponse);
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.nom()).toBeNull();
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('restores session from localStorage on init', () => {
    localStorage.setItem('jwt_token', 'existing.token');
    localStorage.setItem('user_nom', 'Dupont');
    localStorage.setItem('user_prenom', 'Jean');
    localStorage.setItem('user_email', 'jean@example.com');
    localStorage.setItem('user_role', 'ROLE_CLIENT');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([loginRoute])],
    });
    const fresh = TestBed.inject(AuthService);

    expect(fresh.isAuthenticated()).toBe(true);
    expect(fresh.nom()).toBe('Dupont');
  });
});
