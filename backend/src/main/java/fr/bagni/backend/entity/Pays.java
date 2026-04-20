package fr.bagni.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pays")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pays {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;
}
