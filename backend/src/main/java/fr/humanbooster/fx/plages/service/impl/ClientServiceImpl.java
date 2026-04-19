package fr.humanbooster.fx.plages.service.impl;

import java.util.List;
import java.util.Optional;

import fr.humanbooster.fx.plages.business.EmailDejaUtiliseException;
import fr.humanbooster.fx.plages.business.LienDeParente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fr.humanbooster.fx.plages.business.Client;
import fr.humanbooster.fx.plages.business.Pays;
import fr.humanbooster.fx.plages.dao.ClientDao;
import fr.humanbooster.fx.plages.dto.ClientDto;
import fr.humanbooster.fx.plages.exception.ClientInexistantException;
import fr.humanbooster.fx.plages.exception.SuppressionClientImpossibleException;
import fr.humanbooster.fx.plages.mapper.ClientMapper;
import fr.humanbooster.fx.plages.service.ClientService;
import fr.humanbooster.fx.plages.service.LienDeParenteService;
import fr.humanbooster.fx.plages.service.PaysService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ClientServiceImpl implements ClientService {

	private ClientDao clientDao;
	private PaysService paysService;
	private LienDeParenteService lienDeParenteService;
	private ClientMapper clientMapper;
	private PasswordEncoder passwordEncoder;
	
	@Transactional(readOnly = true)
	@Override
	public Page<Client> recupererClients(Pageable pageable) {
		return clientDao.findAll(pageable);
	}

	@Override
	public Client recupererClient(Long idClient) {
		return clientDao.findById(idClient).orElse(null);
	}

	@Override
	public Client enregistrerClient(Client client) {
		client.setMotDePasse(passwordEncoder.encode(client.getMotDePasse()));
		return clientDao.save(client);
	}

	@Override
	public Client enregistrerClient(ClientDto clientDto) {
		Optional<Client> existingClient = clientDao.findByEmail(clientDto.getEmail());
		if (existingClient.isPresent()) {
			// Si l'ID est présent dans clientDto et différent de l'ID du client existant, lancer une exception
			if (clientDto.getId() == null || !existingClient.get().getId().equals(clientDto.getId())) {
				throw new EmailDejaUtiliseException("L'email est déjà utilisé.");
			}
		}

		Pays pays = null;
		if (clientDto.getPaysDto() != null && clientDto.getPaysDto().getCode() != null) {
			pays = paysService.recupererPays(clientDto.getPaysDto().getCode());
		}

		LienDeParente lienDeParente = null;
		if (clientDto.getLienDeParenteDto() != null && clientDto.getLienDeParenteDto().getId() != null) {
			lienDeParente = lienDeParenteService.recupererLienDeParente(clientDto.getLienDeParenteDto().getId());
		}

		Client client = Client.builder()
				.nom(clientDto.getNom())
				.prenom(clientDto.getPrenom())
				.email(clientDto.getEmail())
				.motDePasse(passwordEncoder.encode(clientDto.getMotDePasse()))
				.pays(pays)
				.lienDeParente(lienDeParente)
				.build();

		clientMapper.toEntity(clientDto); // Assurez-vous que cette ligne est nécessaire et utilisée correctement
		return clientDao.save(client);
	}


	@Override
    public boolean supprimerClient(Long id) {
		Client client = recupererClient(id);
		if (client==null) {
			throw new ClientInexistantException("Ce client n'existe pas");
		}
		if (!client.getReservations().isEmpty()) {
			throw new SuppressionClientImpossibleException("Le client ne peut être supprimé car il a effectué des réservations");
		}
        clientDao.delete(client);
        return true;
    }

	@Override
	public List<Client> recupererClients() {
		return clientDao.findAll();
	}

	@Override
	public List<Client> recupererClients(Pays pays) {
		return clientDao.findByPays(pays);
	}

	@Override
	public boolean authenticate(String email, String password) {
		Optional<Client> client = clientDao.findByEmail(email);
		if (client.isPresent()) {
			return passwordEncoder.matches(password, client.get().getMotDePasse());
		}
		return false;
	}

	@Override
	public Client save(Client existingClient) {
		return null;
	}

	@Override
	public Client mettreAJourClientPartiellement(Long id, ClientDto clientDto) {
		Client existingClient = recupererClient(id);
		if (existingClient == null) {
			throw new ClientInexistantException("Ce client n'existe pas");
		}

		if (clientDto.getNom() != null) existingClient.setNom(clientDto.getNom());
		if (clientDto.getPrenom() != null) existingClient.setPrenom(clientDto.getPrenom());
		if (clientDto.getEmail() != null) existingClient.setEmail(clientDto.getEmail());
		if (clientDto.getMotDePasse() != null) existingClient.setMotDePasse(passwordEncoder.encode(clientDto.getMotDePasse()));

		// Autres champs à mettre à jour partiellement ici

		return clientDao.save(existingClient);
	}

//	@Override
//	public Client mettreAJourClient(ClientDto clientDto) {
//		Client client = clientDao.findById(clientDto.getId())
//				.orElseThrow(() -> new ClientInexistantException("Client non trouvé avec l'ID : " + clientDto.getId()));
//
//		client.setNom(clientDto.getNom());
//		client.setPrenom(clientDto.getPrenom());
//		client.setEmail(clientDto.getEmail());
//		client.setPays(paysService.recupererPays(clientDto.getPaysDto().getCode()));
//		client.setLienDeParente(lienDeParenteService.recupererLienDeParente(clientDto.getLienDeParenteDto().getId()));
//		if (clientDto.getLienDeParenteDto() != null) {
//			client.setLienDeParente(lienDeParenteService.recupererLienDeParente(clientDto.getLienDeParenteDto().getId()));
//		}
//		if (clientDto.getMotDePasse() != null && !clientDto.getMotDePasse().trim().isEmpty() &&
//				!passwordEncoder.matches(clientDto.getMotDePasse(), client.getMotDePasse())) {
//			client.setMotDePasse(passwordEncoder.encode(clientDto.getMotDePasse()));
//		}
//
//		if (clientDto.getMotDePasse() != null && !passwordEncoder.matches(clientDto.getMotDePasse(), client.getMotDePasse())) {
//			client.setMotDePasse(passwordEncoder.encode(clientDto.getMotDePasse()));
//		}
//
//		return clientDao.save(client);
//	}



	public Client mettreAJourClient(ClientDto clientDto) {
		Client client = clientDao.findById(clientDto.getId())
				.orElseThrow(() -> new ClientInexistantException("Client non trouvé avec l'ID : " + clientDto.getId()));

		// Mise à jour des autres champs...
		client.setNom(clientDto.getNom());
		client.setPrenom(clientDto.getPrenom());
		client.setEmail(clientDto.getEmail());
		client.setPays(paysService.recupererPays(clientDto.getPaysDto().getCode()));
		if (clientDto.getLienDeParenteDto() != null) {
			client.setLienDeParente(lienDeParenteService.recupererLienDeParente(clientDto.getLienDeParenteDto().getId()));
		}

		// Vérification et mise à jour du mot de passe
		if (clientDto.getMotDePasse() != null && !clientDto.getMotDePasse().isEmpty()) {
			// Si le mot de passe envoyé est différent de l'ancien, hachez-le
			if (!passwordEncoder.matches(clientDto.getMotDePasse(), client.getMotDePasse())) {
				client.setMotDePasse(passwordEncoder.encode(clientDto.getMotDePasse()));
			}
		}

		return clientDao.save(client);
	}

}
