package fr.bagni.backend.repository;

import fr.bagni.backend.entity.Parasol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ParasolRepository extends JpaRepository<Parasol, Long> {

    List<Parasol> findByFileId(Long fileId);

    @Query("""
        SELECT p FROM Parasol p
        WHERE p.id NOT IN (
            SELECT p2.id FROM Reservation r JOIN r.parasols p2
            WHERE r.statut <> 'REFUSEE'
              AND r.dateDebut <= :dateFin
              AND r.dateFin >= :dateDebut
        )
    """)
    List<Parasol> findDisponibles(@Param("dateDebut") LocalDate dateDebut,
                                  @Param("dateFin") LocalDate dateFin);
}
