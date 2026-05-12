package fr.bagni.backend.repository;

import fr.bagni.backend.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByEmail(String email);

    Page<Client> findByPaysId(@NonNull Long paysId, @NonNull Pageable pageable);

    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.client.id = :clientId AND r.statut = 'VALIDEE'")
    boolean hasReservationsValidees(@Param("clientId") @NonNull Long clientId);
}
