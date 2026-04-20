package fr.bagni.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "parasol",
    uniqueConstraints = @UniqueConstraint(columnNames = {"numero_emplacement", "file_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Parasol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_emplacement", nullable = false)
    private int numeroEmplacement;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "file_id", nullable = false)
    private FilePlage file;

    /** Computed identifier like "15F4" — not stored, derived from fields. */
    @Transient
    public String getIdentifiant() {
        return numeroEmplacement + "F" + file.getNumero();
    }
}
