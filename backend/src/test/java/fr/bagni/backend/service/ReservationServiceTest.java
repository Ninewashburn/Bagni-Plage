package fr.bagni.backend.service;

import fr.bagni.backend.dto.request.ReservationRequest;
import fr.bagni.backend.dto.response.ClientResponse;
import fr.bagni.backend.dto.response.ParasolResponse;
import fr.bagni.backend.dto.response.PaysResponse;
import fr.bagni.backend.entity.Client;
import fr.bagni.backend.entity.Concessionnaire;
import fr.bagni.backend.entity.FilePlage;
import fr.bagni.backend.entity.Parasol;
import fr.bagni.backend.entity.Pays;
import fr.bagni.backend.entity.Reservation;
import fr.bagni.backend.entity.enums.Equipement;
import fr.bagni.backend.entity.enums.Statut;
import fr.bagni.backend.exception.BusinessException;
import fr.bagni.backend.repository.ClientRepository;
import fr.bagni.backend.repository.ConcessionnaireRepository;
import fr.bagni.backend.repository.ParasolRepository;
import fr.bagni.backend.repository.ReservationRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.nio.charset.Charset;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReservationServiceTest {

    private final ReservationRepository reservationRepository = mock(ReservationRepository.class);
    private final ClientRepository clientRepository = mock(ClientRepository.class);
    private final ParasolRepository parasolRepository = mock(ParasolRepository.class);
    private final ConcessionnaireRepository concessionnaireRepository = mock(ConcessionnaireRepository.class);
    private final ClientService clientService = mock(ClientService.class);
    private final ParasolService parasolService = mock(ParasolService.class);
    private final TarificationService tarificationService = mock(TarificationService.class);

    private final ReservationService service = new ReservationService(
            reservationRepository,
            clientRepository,
            parasolRepository,
            concessionnaireRepository,
            clientService,
            parasolService,
            tarificationService
    );

    @Test
    void createRefuseUnParasolDejaReserveSurLaPeriode() {
        var request = new ReservationRequest(
                List.of(10L),
                Equipement.UN_LIT,
                LocalDate.of(2026, 7, 1),
                LocalDate.of(2026, 7, 4),
                null,
                null
        );

        when(clientRepository.findByEmail("client@bagni.test")).thenReturn(Optional.of(new Client()));
        when(parasolRepository.findAllByIdForUpdate(List.of(10L))).thenReturn(List.of(parasol(10L)));
        when(reservationRepository.findConflictingParasolIds(
                List.of(10L), request.dateDebut(), request.dateFin(), Statut.REFUSEE
        )).thenReturn(List.of(10L));

        assertThatThrownBy(() -> service.create(request, "client@bagni.test"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("deja reserves");

        verify(reservationRepository, never()).save(any());
    }

    @Test
    void createAccepteUneReservationEnMai() {
        var client = new Client();
        client.setId(3L);
        client.setEmail("client@bagni.test");
        client.setDateInscription(LocalDate.of(2026, 1, 1));

        var request = new ReservationRequest(
                List.of(10L),
                Equipement.DEUX_LITS,
                LocalDate.of(2026, 5, 10),
                LocalDate.of(2026, 5, 11),
                null,
                null
        );

        when(clientRepository.findByEmail("client@bagni.test")).thenReturn(Optional.of(client));
        when(parasolRepository.findAllByIdForUpdate(List.of(10L))).thenReturn(List.of(parasol(10L)));
        when(reservationRepository.findConflictingParasolIds(
                List.of(10L), request.dateDebut(), request.dateFin(), Statut.REFUSEE
        )).thenReturn(List.of());
        when(tarificationService.calculerMontant(
                eq(client),
                any(),
                eq(Equipement.DEUX_LITS),
                eq(request.dateDebut()),
                eq(request.dateFin())
        )).thenReturn(new BigDecimal("106.00"));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation reservation = invocation.getArgument(0);
            reservation.setId(42L);
            return reservation;
        });
        stubResponses();

        var response = service.create(request, "client@bagni.test");

        assertThat(response.id()).isEqualTo(42L);
        assertThat(response.dateDebut()).isEqualTo(LocalDate.of(2026, 5, 10));
        assertThat(response.montantPaye()).isEqualByComparingTo("106.00");
    }

    @Test
    void refuseTraceLeTraitementEtLeRemboursementSimule() {
        var reservation = Reservation.builder()
                .client(new Client())
                .parasols(List.of(parasol(7L)))
                .equipement(Equipement.UN_LIT)
                .dateDebut(LocalDate.of(2026, 7, 1))
                .dateFin(LocalDate.of(2026, 7, 2))
                .montantPaye(new BigDecimal("80.00"))
                .statut(Statut.EN_ATTENTE)
                .build();
        reservation.setId(99L);

        var concessionnaire = new Concessionnaire();
        concessionnaire.setEmail("admin@bagni.test");

        when(reservationRepository.findById(99L)).thenReturn(Optional.of(reservation));
        when(concessionnaireRepository.findByEmail("admin@bagni.test")).thenReturn(Optional.of(concessionnaire));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));
        stubResponses();

        var response = service.refuse(99L, "admin@bagni.test", "Hors capacite");

        assertThat(response.statut()).isEqualTo(Statut.REFUSEE);
        assertThat(response.motifRefus()).isEqualTo("Hors capacite");
        assertThat(response.remboursementReference()).startsWith("REF-SIM-");
        assertThat(response.remboursementStatut()).isEqualTo("REMBOURSE_SIMULE");
        assertThat(response.dateTraitement()).isNotNull();
    }

    @Test
    void generateInvoicePdfUtiliseDesLibellesMetier() {
        var client = new Client();
        client.setNom("Test");
        client.setPrenom("Client");
        client.setEmail("client@bagni.test");
        client.setPays(new Pays(1L, "France"));

        var reservation = Reservation.builder()
                .client(client)
                .parasols(List.of(parasol(7L)))
                .equipement(Equipement.DEUX_LITS)
                .dateDebut(LocalDate.of(2026, 5, 12))
                .dateFin(LocalDate.of(2026, 5, 15))
                .montantPaye(new BigDecimal("212.00"))
                .statut(Statut.EN_ATTENTE)
                .paiementReference("PAY-SIM-123")
                .paiementStatut("CAPTURE_SIMULEE")
                .build();
        reservation.setId(2L);

        when(reservationRepository.findById(2L)).thenReturn(Optional.of(reservation));
        when(tarificationService.supplementEquipementJournalier(Equipement.DEUX_LITS))
                .thenReturn(new BigDecimal("8.00"));

        var pdf = new String(service.generateInvoicePdf(2L, "admin@bagni.test", true), Charset.forName("windows-1252"));

        assertThat(pdf).contains("Mobilier - 2 lits");
        assertThat(pdf).contains("Paiement capturé");
        assertThat(pdf).contains("Montant total payé");
        assertThat(pdf).doesNotContain("DEUX_LITS");
    }

    private Parasol parasol(Long id) {
        var file = FilePlage.builder()
                .id(1L)
                .numero(1)
                .prixJournalier(new BigDecimal("45.00"))
                .build();
        return Parasol.builder()
                .id(id)
                .numeroEmplacement(1)
                .file(file)
                .build();
    }

    private void stubResponses() {
        when(clientService.toResponse(any(Client.class))).thenReturn(
                new ClientResponse(1L, "Client", "Test", "client@bagni.test",
                        new PaysResponse(1L, "France"), LocalDate.of(2026, 1, 1))
        );
        when(parasolService.toParasolResponse(any(Parasol.class))).thenReturn(
                new ParasolResponse(7L, 1, 1, "1F1")
        );
    }
}
