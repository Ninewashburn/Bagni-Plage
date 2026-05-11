package fr.bagni.backend.repository;

import fr.bagni.backend.entity.Concessionnaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConcessionnaireRepository extends JpaRepository<Concessionnaire, Long> {
    Optional<Concessionnaire> findByEmail(String email);
}
