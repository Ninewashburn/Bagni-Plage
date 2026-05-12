package fr.bagni.backend.service;

import fr.bagni.backend.dto.response.BeachScoreResponse;
import fr.bagni.backend.dto.response.BeachSiteResponse;
import fr.bagni.backend.dto.response.NearbyPlaceResponse;
import fr.bagni.backend.dto.response.PassOfferResponse;
import fr.bagni.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogService {

    private static final List<BeachSiteResponse> SITES = List.of(
            new BeachSiteResponse(
                    "mediterranee",
                    "Bagni Plage Méditerranée",
                    "Le Grau-du-Roi, Camargue",
                    "Le Grau-du-Roi",
                    "Grande plage familiale, restaurants proches et promenades en front de mer.",
                    "Une plage pensée pour les journées simples et complètes : accès facile, restaurants à pied, activités nautiques et emplacements premium proches de la mer.",
                    "Mai à septembre",
                    "Dès 40 EUR / jour",
                    "288 parasols",
                    "is-mediterranee",
                    List.of("Famille", "Restaurants à pied", "Parking à 8 min"),
                    List.of("Parking à 8 min", "Restaurants à pied", "Activités nautiques"),
                    List.of(
                            new BeachScoreResponse("Calme", "3/5"),
                            new BeachScoreResponse("Famille", "5/5"),
                            new BeachScoreResponse("Activités", "4/5"),
                            new BeachScoreResponse("Premium", "4/5")
                    )
            ),
            new BeachSiteResponse(
                    "pinede",
                    "Bagni Pinède",
                    "Antibes, Côte d'Azur",
                    "Antibes",
                    "Ambiance calme, pins parasols, criques et coucher de soleil.",
                    "Une adresse plus confidentielle, avec des zones premium, une atmosphère paisible et des recommandations locales pour prolonger la journée.",
                    "Juin à septembre",
                    "Dès 52 EUR / jour",
                    "96 parasols",
                    "is-pinede",
                    List.of("Premium", "Calme", "Vue baie"),
                    List.of("Zone premium", "Paddle matinal", "Vue baie"),
                    List.of(
                            new BeachScoreResponse("Calme", "5/5"),
                            new BeachScoreResponse("Famille", "3/5"),
                            new BeachScoreResponse("Activités", "3/5"),
                            new BeachScoreResponse("Premium", "5/5")
                    )
            ),
            new BeachSiteResponse(
                    "atlantique",
                    "Bagni Atlantique",
                    "La Rochelle, Les Minimes",
                    "La Rochelle",
                    "Séjour iodé, grandes marées, marché local et pistes cyclables.",
                    "Une plage ouverte sur les balades, les arrivées à vélo et les journées plus sportives, avec un prix d'entrée plus accessible.",
                    "Mai à août",
                    "Dès 35 EUR / jour",
                    "144 parasols",
                    "is-atlantique",
                    List.of("Accès vélo", "Marché local", "Balades portuaires"),
                    List.of("Accès vélo", "Marché local", "Balades portuaires"),
                    List.of(
                            new BeachScoreResponse("Calme", "4/5"),
                            new BeachScoreResponse("Famille", "4/5"),
                            new BeachScoreResponse("Activités", "5/5"),
                            new BeachScoreResponse("Premium", "3/5")
                    )
            )
    );

    private static final List<NearbyPlaceResponse> PLACES = List.of(
            new NearbyPlaceResponse("Port des Voiles", "Promenade", "Promenades", "mediterranee", "450 m", "6 min", "Balade de fin de journée entre bateaux, glaciers et terrasses en front de mer.", "Vue mer"),
            new NearbyPlaceResponse("Mercato del Sole", "Marché local", "Marchés", "mediterranee", "700 m", "9 min", "Produits frais, focaccia, fruits d'été et paniers pique-nique à emporter sous le parasol.", "Matin"),
            new NearbyPlaceResponse("La Cabane Azzurra", "Restaurant", "Restaurants", "mediterranee", "280 m", "4 min", "Cuisine simple de plage : poisson grillé, salades, jus frais et menu enfant.", "Famille"),
            new NearbyPlaceResponse("Base Paddle Bagni", "Activité", "Activités nautiques", "pinede", "350 m", "5 min", "Location de paddles et initiation douce le matin quand la mer est calme.", "Sport"),
            new NearbyPlaceResponse("Parking Pineta", "Parking", "Parkings", "pinede", "600 m", "8 min", "Parking ombragé, pratique pour arriver tôt et rejoindre la plage à pied.", "Pratique"),
            new NearbyPlaceResponse("Belvédère della Costa", "Point de vue", "Points de vue", "atlantique", "1,2 km", "16 min", "Petit détour pour voir la côte, idéal avant le dîner ou après la baignade.", "Photo")
    );

    private static final List<PassOfferResponse> OFFERS = List.of(
            new PassOfferResponse("Bagni Day", "À partir de 40 EUR", "Réservation simple pour une journée de plage avec Bagni Pass et facture.", "Journée", List.of("1 parasol", "Accès plage", "Bagni Pass", "Facture PDF"), false, "1 journée", "0 %"),
            new PassOfferResponse("Bagni Week-end", "À partir de 76 EUR", "Deux jours consécutifs avec votre emplacement réservé et un tarif réduit.", "2 jours", List.of("2 jours", "Emplacement suivi", "Tarif réduit", "Bagni Pass"), true, "2 journées", "-5 %"),
            new PassOfferResponse("Bagni Famille", "À partir de 118 EUR", "Formule confort avec transats, casier et avantage boisson.", "Famille", List.of("Parasol famille", "Transats", "Casier", "Réduction boisson"), false, "1 à 3 jours", "-8 %"),
            new PassOfferResponse("Bagni Saison", "Sur demande", "Accès prioritaire aux réservations et réductions sur les équipements.", "Saison", List.of("Priorité", "Réductions", "Choix anticipé", "Multi-plages"), false, "10+ journées", "-15 %"),
            new PassOfferResponse("Bagni Premium", "À partir de 68 EUR", "Zones front de mer, conditions plus flexibles et services confort.", "Premium", List.of("Front de mer", "Annulation souple", "Emplacement prioritaire", "Confort"), false, "1 journée", "-"),
            new PassOfferResponse("Bagni Liberté", "À partir de 180 EUR", "Pack de crédits utilisables sur plusieurs plages pendant la saison.", "Crédits", List.of("5 journées", "Multi-plages", "Bagni Pass", "Factures groupées"), false, "5 journées", "-10 %")
    );

    public List<BeachSiteResponse> findSites() {
        return SITES;
    }

    public BeachSiteResponse findSite(String slug) {
        return SITES.stream()
                .filter(site -> site.slug().equals(slug))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Site de plage introuvable"));
    }

    public List<NearbyPlaceResponse> findPlaces(String siteSlug) {
        return PLACES.stream()
                .filter(place -> siteSlug == null || place.siteSlug().equals(siteSlug))
                .toList();
    }

    public List<PassOfferResponse> findOffers() {
        return OFFERS;
    }
}
