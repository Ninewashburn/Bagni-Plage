package fr.bagni.backend.repository;

import fr.bagni.backend.entity.Reservation;
import fr.bagni.backend.entity.enums.Statut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Page<Reservation> findAll(Pageable pageable);

    Page<Reservation> findByStatut(Statut statut, Pageable pageable);

    List<Reservation> findByClientId(Long clientId);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.statut <> 'REFUSEE'
          AND r.dateDebut <= :dateFin
          AND r.dateFin >= :dateDebut
    """)
    List<Reservation> findForPlanning(@Param("dateDebut") LocalDate dateDebut,
                                      @Param("dateFin") LocalDate dateFin);
}
