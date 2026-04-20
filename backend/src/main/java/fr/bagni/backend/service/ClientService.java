package fr.bagni.backend.service;

import fr.bagni.backend.dto.request.ClientUpdateRequest;
import fr.bagni.backend.dto.response.ClientResponse;
import fr.bagni.backend.dto.response.PaysResponse;
import fr.bagni.backend.entity.Client;
import fr.bagni.backend.exception.BusinessException;
import fr.bagni.backend.exception.ResourceNotFoundException;
import fr.bagni.backend.repository.ClientRepository;
import fr.bagni.backend.repository.PaysRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClientService {

    private final ClientRepository clientRepository;
    private final PaysRepository paysRepository;

    public Page<ClientResponse> findAll(Long paysId, Pageable pageable) {
        Page<Client> clients = paysId != null
                ? clientRepository.findByPaysId(paysId, pageable)
                : clientRepository.findAll(pageable);
        return clients.map(this::toResponse);
    }

    public ClientResponse findById(Long id) {
        return toResponse(getClientOrThrow(id));
    }

    public Client findByEmailOrThrow(String email) {
        return clientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
    }

    @Transactional
    public ClientResponse update(Long id, ClientUpdateRequest request) {
        var client = getClientOrThrow(id);
        var pays = paysRepository.findById(request.paysId())
                .orElseThrow(() -> new ResourceNotFoundException("Pays introuvable"));

        client.setNom(request.nom());
        client.setPrenom(request.prenom());
        client.setEmail(request.email());
        client.setPays(pays);

        return toResponse(clientRepository.save(client));
    }

    @Transactional
    public void delete(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Client introuvable");
        }
        if (clientRepository.hasReservationsValidees(id)) {
            throw new BusinessException("Impossible de supprimer un client ayant des réservations validées");
        }
        clientRepository.deleteById(id);
    }

    private Client getClientOrThrow(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
    }

    public ClientResponse toResponse(Client client) {
        PaysResponse paysResponse = client.getPays() != null
                ? new PaysResponse(client.getPays().getId(), client.getPays().getNom())
                : null;
        return new ClientResponse(client.getId(), client.getNom(), client.getPrenom(),
                client.getEmail(), paysResponse, client.getDateInscription());
    }
}
