package fr.bagni.backend.service;

import fr.bagni.backend.dto.request.ClientUpdateRequest;
import fr.bagni.backend.dto.response.ClientResponse;
import fr.bagni.backend.dto.response.PaysResponse;
import fr.bagni.backend.entity.Client;
import fr.bagni.backend.exception.BusinessException;
import fr.bagni.backend.exception.ResourceNotFoundException;
import fr.bagni.backend.repository.ClientRepository;
import fr.bagni.backend.repository.PaysRepository;
import fr.bagni.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClientService {

    private final ClientRepository clientRepository;
    private final PaysRepository paysRepository;
    private final UtilisateurRepository utilisateurRepository;

    public Page<ClientResponse> findAll(Long paysId, @NonNull Pageable pageable) {
        Page<Client> clients = paysId != null
                ? clientRepository.findByPaysId(paysId, pageable)
                : clientRepository.findAll(pageable);
        return clients.map(this::toResponse);
    }

    public ClientResponse findById(Long id) {
        return toResponse(getClientOrThrow(requireId(id, "clientId")));
    }

    public Client findByEmailOrThrow(String email) {
        return clientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
    }

    @Transactional
    public ClientResponse update(Long id, ClientUpdateRequest request) {
        var client = getClientOrThrow(id);

        if (!request.email().equalsIgnoreCase(client.getEmail())
                && utilisateurRepository.existsByEmail(request.email())) {
            throw new BusinessException("Cet email est déjà utilisé par un autre compte");
        }

        var paysId = requireId(request.paysId(), "paysId");
        var pays = paysRepository.findById(paysId)
                .orElseThrow(() -> new ResourceNotFoundException("Pays introuvable"));

        client.setNom(request.nom());
        client.setPrenom(request.prenom());
        client.setEmail(request.email());
        client.setPays(pays);

        return toResponse(clientRepository.save(Objects.requireNonNull(client)));
    }

    @Transactional
    public void delete(Long id) {
        var clientId = requireId(id, "clientId");
        if (!clientRepository.existsById(clientId)) {
            throw new ResourceNotFoundException("Client introuvable");
        }
        if (clientRepository.hasReservationsValidees(clientId)) {
            throw new BusinessException("Impossible de supprimer un client ayant des réservations validées");
        }
        clientRepository.deleteById(clientId);
    }

    private Client getClientOrThrow(Long id) {
        var clientId = requireId(id, "clientId");
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
    }

    private @NonNull Long requireId(Long id, String label) {
        return Objects.requireNonNull(id, label + " obligatoire");
    }

    public ClientResponse toResponse(Client client) {
        PaysResponse paysResponse = client.getPays() != null
                ? new PaysResponse(client.getPays().getId(), client.getPays().getNom())
                : null;
        return new ClientResponse(client.getId(), client.getNom(), client.getPrenom(),
                client.getEmail(), paysResponse, client.getDateInscription());
    }
}
