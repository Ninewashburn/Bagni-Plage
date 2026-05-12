package fr.bagni.backend.controller;

import fr.bagni.backend.dto.response.BeachSiteResponse;
import fr.bagni.backend.dto.response.NearbyPlaceResponse;
import fr.bagni.backend.dto.response.PassOfferResponse;
import fr.bagni.backend.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/sites")
    public List<BeachSiteResponse> sites() {
        return catalogService.findSites();
    }

    @GetMapping("/sites/{slug}")
    public BeachSiteResponse site(@PathVariable String slug) {
        return catalogService.findSite(slug);
    }

    @GetMapping("/sites/{slug}/nearby-places")
    public List<NearbyPlaceResponse> nearbyPlaces(@PathVariable String slug) {
        return catalogService.findPlaces(slug);
    }

    @GetMapping("/guide-places")
    public List<NearbyPlaceResponse> guidePlaces(@RequestParam(required = false) String siteSlug) {
        return catalogService.findPlaces(siteSlug);
    }

    @GetMapping("/offers")
    public List<PassOfferResponse> offers() {
        return catalogService.findOffers();
    }
}
