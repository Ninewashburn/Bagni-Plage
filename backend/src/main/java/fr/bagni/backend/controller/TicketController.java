package fr.bagni.backend.controller;

import fr.bagni.backend.dto.response.ReservationTicketResponse;
import fr.bagni.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final ReservationService reservationService;

    @GetMapping("/{ticketCode}")
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public ReservationTicketResponse find(@PathVariable String ticketCode,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.findTicketByCode(ticketCode, userDetails.getUsername());
    }

    @PostMapping("/{ticketCode}/check-in")
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public ReservationTicketResponse checkIn(@PathVariable String ticketCode,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.checkIn(ticketCode, userDetails.getUsername());
    }
}
