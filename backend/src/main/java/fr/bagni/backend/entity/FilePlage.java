package fr.bagni.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "file_plage")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilePlage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private int numero;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixJournalier;

    @OneToMany(mappedBy = "file", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("numeroEmplacement ASC")
    private List<Parasol> parasols = new ArrayList<>();
}
