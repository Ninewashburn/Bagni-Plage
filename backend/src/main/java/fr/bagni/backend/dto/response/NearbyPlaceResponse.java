package fr.bagni.backend.dto.response;

public record NearbyPlaceResponse(
        String name,
        String type,
        String category,
        String siteSlug,
        String distance,
        String walk,
        String description,
        String tag
) {}
