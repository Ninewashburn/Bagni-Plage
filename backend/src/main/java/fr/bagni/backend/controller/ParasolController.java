package fr.bagni.backend.controller;

import fr.bagni.backend.dto.response.FilePlageResponse;
import fr.bagni.backend.dto.response.ParasolResponse;
import fr.bagni.backend.service.ParasolService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/parasols")
@RequiredArgsConstructor
public class ParasolController {

    private final ParasolService parasolService;

    @GetMapping("/files")
    @PreAuthorize("isAuthenticated()")
    public List<FilePlageResponse> findAllFiles() {
        return parasolService.findAllFiles();
    }

    @GetMapping("/disponibles")
    @PreAuthorize("isAuthenticated()")
    public List<ParasolResponse> findDisponibles(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return parasolService.findDisponibles(dateDebut, dateFin);
    }
}
