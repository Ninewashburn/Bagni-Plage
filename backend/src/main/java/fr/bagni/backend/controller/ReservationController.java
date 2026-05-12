package fr.bagni.backend.controller;

import fr.bagni.backend.dto.request.ReservationRequest;
import fr.bagni.backend.dto.request.ReservationDecisionRequest;
import fr.bagni.backend.dto.response.ReservationResponse;
import fr.bagni.backend.dto.response.ReservationTicketResponse;
import fr.bagni.backend.entity.enums.Statut;
import fr.bagni.backend.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public Page<ReservationResponse> findAll(
            @RequestParam(required = false) Statut statut,
            @PageableDefault(sort = "dateDebut", direction = Sort.Direction.DESC) @NonNull Pageable pageable) {
        return statut == null ? reservationService.findAll(pageable) : reservationService.findByStatut(statut, pageable);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public Page<ReservationResponse> findPending(
            @PageableDefault(sort = "dateDebut", direction = Sort.Direction.DESC) @NonNull Pageable pageable) {
        return reservationService.findPending(pageable);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CLIENT')")
    public List<ReservationResponse> findMine(@AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.findByClientEmail(userDetails.getUsername());
    }

    @GetMapping("/{id}/invoice")
    @PreAuthorize("hasAnyRole('CLIENT', 'CONCESSIONNAIRE')")
    public ResponseEntity<byte[]> invoice(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        boolean concessionnaire = userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_CONCESSIONNAIRE"));
        byte[] pdf = reservationService.generateInvoicePdf(id, userDetails.getUsername(), concessionnaire);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=facture-bagni-" + id + ".pdf")
                .body(pdf);
    }

    @GetMapping("/{id}/ticket")
    @PreAuthorize("hasAnyRole('CLIENT', 'CONCESSIONNAIRE')")
    public ReservationTicketResponse ticket(@PathVariable Long id,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        boolean concessionnaire = userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_CONCESSIONNAIRE"));
        return reservationService.getTicket(id, userDetails.getUsername(), concessionnaire);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'CONCESSIONNAIRE')")
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse create(@Valid @RequestBody ReservationRequest request,
                                      @AuthenticationPrincipal UserDetails userDetails) {
        boolean concessionnaire = userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_CONCESSIONNAIRE"));
        return concessionnaire
                ? reservationService.createForClient(request)
                : reservationService.create(request, userDetails.getUsername());
    }

    @PatchMapping("/{id}/validate")
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public ReservationResponse validate(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.validate(id, userDetails.getUsername());
    }

    @PatchMapping("/{id}/refuse")
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public ReservationResponse refuse(@PathVariable Long id,
                                      @RequestBody(required = false) ReservationDecisionRequest request,
                                      @AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.refuse(
                id,
                userDetails.getUsername(),
                request == null ? null : request.motif()
        );
    }

}
