package fr.bagni.backend.dto.response;

public record ParasolResponse(
        Long id,
        int numeroEmplacement,
        int numeroFile,
        String identifiant
) {}
