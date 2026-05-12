package fr.bagni.backend.repository;

import fr.bagni.backend.entity.Reservation;
import fr.bagni.backend.entity.enums.Statut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Page<Reservation> findByStatut(@NonNull Statut statut, @NonNull Pageable pageable);

    List<Reservation> findByClientId(@NonNull Long clientId);

    Optional<Reservation> findByTicketCode(@NonNull String ticketCode);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.statut <> 'REFUSEE'
          AND r.dateDebut <= :dateFin
          AND r.dateFin >= :dateDebut
    """)
    List<Reservation> findForPlanning(@Param("dateDebut") @NonNull LocalDate dateDebut,
                                      @Param("dateFin") @NonNull LocalDate dateFin);

    @Query("""
        SELECT DISTINCT p.id FROM Reservation r JOIN r.parasols p
        WHERE r.statut <> :statutRefuse
          AND p.id IN :parasolIds
          AND r.dateDebut <= :dateFin
          AND r.dateFin >= :dateDebut
    """)
    List<Long> findConflictingParasolIds(@Param("parasolIds") @NonNull List<Long> parasolIds,
                                         @Param("dateDebut") @NonNull LocalDate dateDebut,
                                         @Param("dateFin") @NonNull LocalDate dateFin,
                                         @Param("statutRefuse") @NonNull Statut statutRefuse);
}
