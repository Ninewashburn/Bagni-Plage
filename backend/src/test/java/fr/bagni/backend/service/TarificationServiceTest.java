package fr.bagni.backend.service;

import fr.bagni.backend.entity.Client;
import fr.bagni.backend.entity.FilePlage;
import fr.bagni.backend.entity.LienParente;
import fr.bagni.backend.entity.Parasol;
import fr.bagni.backend.entity.enums.Equipement;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TarificationServiceTest {

    private final TarificationService service = new TarificationService();

    @Test
    void calculerMontantAppliqueParenteEtFideliteSurPrixFile() {
        var client = new Client();
        client.setDateInscription(LocalDate.of(2021, 6, 1));

        var lien = LienParente.builder()
                .client(client)
                .typeParente("Frere/Soeur")
                .reductionPourcent(50)
                .build();
        client.setLiensParente(List.of(lien));

        var file = FilePlage.builder()
                .numero(1)
                .prixJournalier(new BigDecimal("45.00"))
                .build();
        var parasol = Parasol.builder()
                .id(1L)
                .numeroEmplacement(15)
                .file(file)
                .build();

        BigDecimal montant = service.calculerMontant(
                client,
                List.of(parasol),
                Equipement.UN_LIT,
                LocalDate.of(2026, 7, 1),
                LocalDate.of(2026, 7, 3)
        );

        assertThat(montant).isEqualByComparingTo("60.75");
    }

    @Test
    void calculerMontantAjouteLeSupplementEquipementParJour() {
        var client = new Client();
        client.setDateInscription(LocalDate.of(2026, 1, 1));

        var file = FilePlage.builder()
                .numero(3)
                .prixJournalier(new BigDecimal("35.00"))
                .build();
        var parasol = Parasol.builder()
                .id(4L)
                .numeroEmplacement(8)
                .file(file)
                .build();

        BigDecimal montant = service.calculerMontant(
                client,
                List.of(parasol),
                Equipement.DEUX_LITS,
                LocalDate.of(2026, 5, 10),
                LocalDate.of(2026, 5, 11)
        );

        assertThat(montant).isEqualByComparingTo("86.00");
    }
}
