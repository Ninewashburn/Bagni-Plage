package fr.bagni.backend.dto.response;

import fr.bagni.backend.entity.enums.Equipement;
import fr.bagni.backend.entity.enums.Statut;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReservationResponse(
        Long id,
        ClientResponse client,
        List<ParasolResponse> parasols,
        Equipement equipement,
        LocalDate dateDebut,
        LocalDate dateFin,
        BigDecimal montantPaye,
        Statut statut,
        String remarques
) {}
