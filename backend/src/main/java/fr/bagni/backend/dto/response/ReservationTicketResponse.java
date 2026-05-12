package fr.bagni.backend.dto.response;

import java.time.LocalDateTime;

public record ReservationTicketResponse(
        Long reservationId,
        String ticketCode,
        String ticketToken,
        String statut,
        LocalDateTime emisLe,
        LocalDateTime utiliseLe,
        String qrPayload,
        String client,
        String periode,
        String parasols,
        String equipement
) {}
