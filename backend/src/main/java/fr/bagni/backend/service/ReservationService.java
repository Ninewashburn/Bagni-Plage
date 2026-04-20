package fr.bagni.backend.service;

import fr.bagni.backend.dto.request.ReservationRequest;
import fr.bagni.backend.dto.response.ReservationResponse;
import fr.bagni.backend.entity.Client;
import fr.bagni.backend.entity.Reservation;
import fr.bagni.backend.entity.enums.Statut;
import fr.bagni.backend.exception.BusinessException;
import fr.bagni.backend.exception.ResourceNotFoundException;
import fr.bagni.backend.repository.ClientRepository;
import fr.bagni.backend.repository.ParasolRepository;
import fr.bagni.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ClientRepository clientRepository;
    private final ParasolRepository parasolRepository;
    private final ClientService clientService;
    private final ParasolService parasolService;

    public Page<ReservationResponse> findAll(Pageable pageable) {
        return reservationRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<ReservationResponse> findPending(Pageable pageable) {
        return reservationRepository.findByStatut(Statut.EN_ATTENTE, pageable).map(this::toResponse);
    }

    public List<ReservationResponse> findByClient(Long clientId) {
        return reservationRepository.findByClientId(clientId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReservationResponse> findByClientEmail(String email) {
        var client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
        return findByClient(client.getId());
    }

    public List<ReservationResponse> findForPlanning(LocalDate from, LocalDate to) {
        return reservationRepository.findForPlanning(from, to).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReservationResponse create(ReservationRequest request, String clientEmail) {
        var client = clientRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));

        var parasols = parasolRepository.findAllById(request.parasolIds());
        if (parasols.size() != request.parasolIds().size()) {
            throw new ResourceNotFoundException("Un ou plusieurs parasols introuvables");
        }

        if (request.dateFin().isBefore(request.dateDebut())) {
            throw new BusinessException("La date de fin doit être après la date de début");
        }

        var reservation = Reservation.builder()
                .client(client)
                .parasols(parasols)
                .equipement(request.equipement())
                .dateDebut(request.dateDebut())
                .dateFin(request.dateFin())
                .montantPaye(request.montantPaye())
                .statut(Statut.EN_ATTENTE)
                .remarques(request.remarques())
                .build();

        return toResponse(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationResponse validate(Long id) {
        var reservation = getOrThrow(id);
        if (reservation.getStatut() != Statut.EN_ATTENTE) {
            throw new BusinessException("Seules les réservations en attente peuvent être validées");
        }
        reservation.setStatut(Statut.VALIDEE);
        return toResponse(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationResponse refuse(Long id) {
        var reservation = getOrThrow(id);
        if (reservation.getStatut() != Statut.EN_ATTENTE) {
            throw new BusinessException("Seules les réservations en attente peuvent être refusées");
        }
        reservation.setStatut(Statut.REFUSEE);
        return toResponse(reservationRepository.save(reservation));
    }

    private Reservation getOrThrow(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation introuvable"));
    }

    private ReservationResponse toResponse(Reservation r) {
        var parasols = r.getParasols().stream()
                .map(parasolService::toParasolResponse)
                .toList();
        return new ReservationResponse(r.getId(), clientService.toResponse(r.getClient()),
                parasols, r.getEquipement(), r.getDateDebut(), r.getDateFin(),
                r.getMontantPaye(), r.getStatut(), r.getRemarques());
    }
}
