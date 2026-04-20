package fr.bagni.backend.repository;

import fr.bagni.backend.entity.FilePlage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FilePlageRepository extends JpaRepository<FilePlage, Long> {
    Optional<FilePlage> findByNumero(int numero);
}
