package fr.bagni.backend.entity;

import fr.bagni.backend.entity.enums.Equipement;
import fr.bagni.backend.entity.enums.Statut;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToMany
    @JoinTable(
        name = "reservation_parasol",
        joinColumns = @JoinColumn(name = "reservation_id"),
        inverseJoinColumns = @JoinColumn(name = "parasol_id")
    )
    @Builder.Default
    private List<Parasol> parasols = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Equipement equipement;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(name = "montant_paye", nullable = false, precision = 10, scale = 2)
    private BigDecimal montantPaye;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private Statut statut = Statut.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String remarques;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traite_par_id")
    private Concessionnaire traitePar;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "motif_refus", columnDefinition = "TEXT")
    private String motifRefus;

    @Column(name = "paiement_reference", length = 80)
    private String paiementReference;

    @Column(name = "paiement_statut", length = 40)
    private String paiementStatut;

    @Column(name = "remboursement_reference", length = 80)
    private String remboursementReference;

    @Column(name = "remboursement_statut", length = 40)
    private String remboursementStatut;

    @Column(name = "ticket_code", length = 40, unique = true)
    private String ticketCode;

    @Column(name = "ticket_token", length = 120)
    private String ticketToken;

    @Column(name = "ticket_statut", length = 30)
    private String ticketStatut;

    @Column(name = "ticket_emis_le")
    private LocalDateTime ticketEmisLe;

    @Column(name = "ticket_utilise_le")
    private LocalDateTime ticketUtiliseLe;
}
