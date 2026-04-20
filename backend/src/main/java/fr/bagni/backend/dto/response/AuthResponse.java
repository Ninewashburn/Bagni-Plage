package fr.bagni.backend.dto.response;

public record AuthResponse(
        String token,
        String email,
        String nom,
        String prenom,
        String role
) {}
