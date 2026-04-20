package fr.bagni.backend.controller;

import fr.bagni.backend.dto.request.ClientUpdateRequest;
import fr.bagni.backend.dto.response.ClientResponse;
import fr.bagni.backend.service.ClientService;
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

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public Page<ClientResponse> findAll(
            @RequestParam(required = false) Long paysId,
            @PageableDefault(sort = "dateInscription", direction = Sort.Direction.DESC) Pageable pageable) {
        return clientService.findAll(paysId, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    public ClientResponse findById(@PathVariable Long id) {
        return clientService.findById(id);
    }

    @PatchMapping("/me")
    @PreAuthorize("hasRole('CLIENT')")
    public ClientResponse updateMe(@Valid @RequestBody ClientUpdateRequest request,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        var client = clientService.findByEmailOrThrow(userDetails.getUsername());
        return clientService.update(client.getId(), request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CONCESSIONNAIRE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        clientService.delete(id);
    }
}
