package fr.bagni.backend.dto.request;

import fr.bagni.backend.entity.enums.Equipement;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record ReservationRequest(
        @NotEmpty List<@NotNull Long> parasolIds,
        @NotNull Equipement equipement,
        @NotNull @FutureOrPresent LocalDate dateDebut,
        @NotNull @FutureOrPresent LocalDate dateFin,
        String remarques,
        Long clientId
) {}
