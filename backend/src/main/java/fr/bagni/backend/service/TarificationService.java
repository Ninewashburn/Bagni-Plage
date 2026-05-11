package fr.bagni.backend.service;

import fr.bagni.backend.entity.Client;
import fr.bagni.backend.entity.Parasol;
import fr.bagni.backend.entity.enums.Equipement;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TarificationService {

    private static final BigDecimal CENT = BigDecimal.valueOf(100);
    private static final int MAX_REDUCTION_FIDELITE = 20;

    public BigDecimal calculerMontant(Client client, List<Parasol> parasols, Equipement equipement,
                                      LocalDate dateDebut, LocalDate dateFin) {
        long nbJours = ChronoUnit.DAYS.between(dateDebut, dateFin) + 1;
        BigDecimal prixJournalier = parasols.stream()
                .map(p -> p.getFile().getPrixJournalier())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        prixJournalier = prixJournalier.add(supplementEquipementJournalier(equipement));

        BigDecimal montant = prixJournalier.multiply(BigDecimal.valueOf(nbJours));
        montant = appliquerReduction(montant, reductionParente(client));
        montant = appliquerReduction(montant, reductionFidelite(client, dateDebut));

        return montant.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal supplementEquipementJournalier(Equipement equipement) {
        return switch (equipement) {
            case UN_LIT -> BigDecimal.ZERO;
            case UN_FAUTEUIL -> new BigDecimal("4.00");
            case FAUTEUIL_ET_LIT -> new BigDecimal("6.00");
            case DEUX_LITS, DEUX_FAUTEUILS -> new BigDecimal("8.00");
        };
    }

    private BigDecimal appliquerReduction(BigDecimal montant, int reductionPourcent) {
        if (reductionPourcent <= 0) {
            return montant;
        }
        BigDecimal multiplicateur = CENT.subtract(BigDecimal.valueOf(reductionPourcent)).divide(CENT, 4, RoundingMode.HALF_UP);
        return montant.multiply(multiplicateur);
    }

    private int reductionParente(Client client) {
        if (client.getLiensParente() == null || client.getLiensParente().isEmpty()) {
            return 0;
        }
        return client.getLiensParente().stream()
                .mapToInt(lien -> lien.getReductionPourcent())
                .max()
                .orElse(0);
    }

    private int reductionFidelite(Client client, LocalDate dateReference) {
        if (client.getDateInscription() == null || dateReference.isBefore(client.getDateInscription())) {
            return 0;
        }
        long annees = ChronoUnit.YEARS.between(client.getDateInscription(), dateReference);
        return Math.min(MAX_REDUCTION_FIDELITE, Math.toIntExact(Math.max(0, annees)) * 2);
    }
}
