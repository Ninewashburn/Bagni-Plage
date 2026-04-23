import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ReservationService } from './reservation.service';
import { Reservation } from '../models/reservation.model';

const BASE = 'http://localhost:8080/api';

const makeReservation = (id: number): Reservation => ({
  id,
  client: {
    id: 1,
    nom: 'Test',
    prenom: 'User',
    email: 'u@x.com',
    pays: { id: 1, nom: 'France' },
    dateInscription: '2024-01-01',
  },
  parasols: [{ id: 10, numeroEmplacement: 5, numeroFile: 2, identifiant: '5F2' }],
  equipement: 'UN_LIT',
  dateDebut: '2026-07-01',
  dateFin: '2026-07-07',
  montantPaye: 350,
  statut: 'EN_ATTENTE',
  remarques: '',
});

describe('ReservationService', () => {
  let service: ReservationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(ReservationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll calls GET /reservations with page params', () => {
    service.getAll(0, 20).subscribe();
    const req = httpMock.expectOne(r => r.url === `${BASE}/reservations`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    req.flush({ content: [], totalElements: 0 });
  });

  it('getPending calls GET /reservations/pending', () => {
    service.getPending(0, 5).subscribe();
    const req = httpMock.expectOne(r => r.url === `${BASE}/reservations/pending`);
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], totalElements: 0 });
  });

  it('getMy calls GET /reservations/my', () => {
    service.getMy().subscribe();
    const req = httpMock.expectOne(`${BASE}/reservations/my`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('validate calls PATCH /reservations/:id/validate', () => {
    service.validate(42).subscribe();
    const req = httpMock.expectOne(`${BASE}/reservations/42/validate`);
    expect(req.request.method).toBe('PATCH');
    req.flush(makeReservation(42));
  });

  it('refuse calls PATCH /reservations/:id/refuse', () => {
    service.refuse(7).subscribe();
    const req = httpMock.expectOne(`${BASE}/reservations/7/refuse`);
    expect(req.request.method).toBe('PATCH');
    req.flush(makeReservation(7));
  });

  it('getPlanning calls GET /planning with from/to params', () => {
    service.getPlanning('2026-07-01', '2026-07-07').subscribe();
    const req = httpMock.expectOne(r => r.url === `${BASE}/planning`);
    expect(req.request.params.get('from')).toBe('2026-07-01');
    expect(req.request.params.get('to')).toBe('2026-07-07');
    req.flush([]);
  });

  it('create posts the reservation request', () => {
    const payload = {
      parasolIds: [10],
      equipement: 'UN_LIT' as const,
      dateDebut: '2026-07-01',
      dateFin: '2026-07-07',
      montantPaye: 350,
    };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${BASE}/reservations`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(makeReservation(1));
  });
});
