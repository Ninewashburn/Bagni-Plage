package fr.bagni.backend.controller;

import fr.bagni.backend.dto.request.ReservationRequest;
import fr.bagni.backend.dto.response.ReservationResponse;
import fr.bagni.backend.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
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
            @PageableDefault(sort = "dateDebut", direction = Sort.Direction.DESC) Pageable pageable) {
        return reservationService.findAll(pageable);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public Page<ReservationResponse> findPending(
            @PageableDefault(sort = "dateDebut", direction = Sort.Direction.DESC) Pageable pageable) {
        return reservationService.findPending(pageable);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CLIENT')")
    public List<ReservationResponse> findMine(@AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.findByClientEmail(userDetails.getUsername());
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse create(@Valid @RequestBody ReservationRequest request,
                                      @AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.create(request, userDetails.getUsername());
    }

    @PatchMapping("/{id}/validate")
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public ReservationResponse validate(@PathVariable Long id) {
        return reservationService.validate(id);
    }

    @PatchMapping("/{id}/refuse")
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public ReservationResponse refuse(@PathVariable Long id) {
        return reservationService.refuse(id);
    }
}
