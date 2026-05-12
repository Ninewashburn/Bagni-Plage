package fr.bagni.backend.dto.response;

import java.util.List;

public record PassOfferResponse(
        String name,
        String price,
        String description,
        String badge,
        List<String> includes,
        boolean recommended,
        String credits,
        String discount
) {}
