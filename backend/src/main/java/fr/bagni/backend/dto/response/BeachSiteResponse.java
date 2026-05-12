package fr.bagni.backend.dto.response;

import java.util.List;

public record BeachSiteResponse(
        String slug,
        String name,
        String location,
        String city,
        String mood,
        String longDescription,
        String season,
        String price,
        String availability,
        String imageClass,
        List<String> badges,
        List<String> highlights,
        List<BeachScoreResponse> scores
) {}
