package fr.bagni.backend.dto.response;

import java.time.LocalDate;

public record ClientResponse(
        Long id,
        String nom,
        String prenom,
        String email,
        PaysResponse pays,
        LocalDate dateInscription
) {}
