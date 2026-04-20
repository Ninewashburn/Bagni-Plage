package fr.bagni.backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record FilePlageResponse(
        Long id,
        int numero,
        BigDecimal prixJournalier,
        List<ParasolResponse> parasols
) {}
