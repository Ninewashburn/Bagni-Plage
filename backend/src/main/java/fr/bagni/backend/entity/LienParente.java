package fr.bagni.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lien_parente")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LienParente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "type_parente", nullable = false)
    private String typeParente;

    @Column(name = "reduction_pourcent", nullable = false)
    private int reductionPourcent;
}
