package fr.bagni.backend.controller;

import fr.bagni.backend.dto.response.PaysResponse;
import fr.bagni.backend.service.PaysService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pays")
@RequiredArgsConstructor
public class PaysController {

    private final PaysService paysService;

    @GetMapping
    public List<PaysResponse> findAll() {
        return paysService.findAll();
    }
}
