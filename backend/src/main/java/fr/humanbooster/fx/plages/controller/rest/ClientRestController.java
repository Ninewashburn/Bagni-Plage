package fr.humanbooster.fx.plages.controller.rest;

import javax.validation.Valid;

import fr.humanbooster.fx.plages.business.Utilisateur;
import fr.humanbooster.fx.plages.dto.AuthentificationDto;
import fr.humanbooster.fx.plages.exception.ClientInexistantException;
import fr.humanbooster.fx.plages.service.PaysService;
import fr.humanbooster.fx.plages.service.UtilisateurService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import fr.humanbooster.fx.plages.business.Client;
import fr.humanbooster.fx.plages.dto.ClientDto;
import fr.humanbooster.fx.plages.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;

import java.util.Map;

import static fr.humanbooster.fx.plages.controller.ErreurController.logger;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
@Validated
public class ClientRestController {

    private ClientService clientService;
    private PaysService paysService;
    private UtilisateurService utilisateurService;

    @GetMapping("clients")
    public Page<Client> getClients(@PageableDefault(page = 0, size = 10, sort = "email") Pageable pageable) {
        return clientService.recupererClients(pageable);
    }

    @Operation(description = "Renvoie le client dont l'id est donné en paramètre")
    @GetMapping("clients/{id}")
    public Client getClient(@PathVariable Long id) {
        return clientService.recupererClient(id);
    }

    /*
     * {
  "nom": "COTE",
  "prenom": "Fx",
  "email": "fxcote@clelia.fr",
  "motDePasse": "12345678",
  "paysDto": {
    "code": "FR",
    "nom": "France"
  },
  "lienDeParenteDto": {
    "id": 3,
    "nom": "Aucun",
    "coefficient": 1
  }
}
     */
    @PostMapping("clients")
    @ResponseStatus(code = HttpStatus.CREATED)
    public Client postClient(@Valid @RequestBody ClientDto clientDto, BindingResult result) {
        return clientService.enregistrerClient(clientDto);
    }

    @Operation(description = "Met à jour complètement le client")
    @PutMapping("clients")
    @ResponseStatus(code = HttpStatus.OK)
    public ResponseEntity<Client> putClient(@RequestBody ClientDto clientDto) {
        if (clientDto.getId() != null) {
            if (clientService.recupererClient(clientDto.getId()) != null) {
                Client client = clientService.enregistrerClient(clientDto);
                return ResponseEntity.status(200).body(client);
            } else {
                return ResponseEntity.status(404).body(null);
            }
        } else {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody AuthentificationDto authentificationDto) {
        // Implémentez votre logique d'authentification ici, généralement via un service AuthService
        System.out.println("Controller login");
        logger.info("Email reçu: " + authentificationDto.getEmail());
        logger.info("Mot de passe reçu: " + authentificationDto.getMotDePasse());

        boolean isAuthenticated = clientService.authenticate(authentificationDto.getEmail(), authentificationDto.getMotDePasse());
        logger.info("Est authentifié: " + isAuthenticated);
        System.out.println("Est authentifié: " + isAuthenticated);

        if (isAuthenticated) {
            Utilisateur client = utilisateurService.recupererUtilisateur(authentificationDto.getEmail());
            System.out.println("ID de l'utilisateur connecté: " + client.getId());
            return ResponseEntity.ok(Map.of("message", "Authentification réussie", "clientId", client.getId()));
        } else {
            return new ResponseEntity<>("Échec de l'authentification", HttpStatus.UNAUTHORIZED);
        }

    }

//    @PatchMapping("clients/{id}")
//    public ResponseEntity<Client> patchClient(@PathVariable Long id, @RequestBody ClientDto clientDto) {
//        try {
//            Client updatedClient = clientService.mettreAJourClientPartiellement(id, clientDto);
//            return ResponseEntity.ok(updatedClient);
//        } catch (ClientInexistantException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
//        }
//    }

//    @PatchMapping("clients/{id}")
//    public ResponseEntity<Client> patchClient(@PathVariable Long id, @RequestBody ClientDto clientDto) {
//        Client clientExistant = clientService.recupererClient(id);
//        if (clientExistant == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
//        }
//
//        // Mettre à jour seulement les champs spécifiés
//        if (clientDto.getNom() != null) clientExistant.setNom(clientDto.getNom());
//        if (clientDto.getPrenom() != null) clientExistant.setPrenom(clientDto.getPrenom());
//        if (clientDto.getEmail() != null) clientExistant.setEmail(clientDto.getEmail());
//        if (clientDto.getPaysDto() != null) {
//            clientExistant.setPays(paysService.recupererPays(clientDto.getPaysDto().getCode()));
//        }
//
//        clientService.enregistrerClient(clientExistant);
//        return ResponseEntity.ok(clientExistant);
//    }

    @PatchMapping("clients/{id}")
    public ResponseEntity<Client> patchClient(@PathVariable Long id, @RequestBody ClientDto clientDto) {
        try {
            Client clientMiseAJour = clientService.mettreAJourClient(clientDto);
            return ResponseEntity.ok(clientMiseAJour);
        } catch (ClientInexistantException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            // Log
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @DeleteMapping("clients/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id) {
        try {
            clientService.supprimerClient(id);
            return ResponseEntity.ok().build(); // Réponse en cas de succès
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la suppression du client");
        }
    }
}