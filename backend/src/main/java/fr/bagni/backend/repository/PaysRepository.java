package fr.bagni.backend.repository;

import fr.bagni.backend.entity.Pays;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaysRepository extends JpaRepository<Pays, Long> {
    Optional<Pays> findByNom(String nom);
    List<Pays> findAllByOrderByNomAsc();
}
