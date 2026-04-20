package fr.bagni.backend.dto.request;

import fr.bagni.backend.entity.enums.Equipement;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReservationRequest(
        @NotEmpty List<Long> parasolIds,
        @NotNull Equipement equipement,
        @NotNull @FutureOrPresent LocalDate dateDebut,
        @NotNull LocalDate dateFin,
        @NotNull BigDecimal montantPaye,
        String remarques
) {}
