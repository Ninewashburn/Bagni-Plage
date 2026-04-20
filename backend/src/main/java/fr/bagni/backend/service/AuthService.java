package fr.bagni.backend.service;

import fr.bagni.backend.dto.request.LoginRequest;
import fr.bagni.backend.dto.request.RegisterClientRequest;
import fr.bagni.backend.dto.response.AuthResponse;
import fr.bagni.backend.entity.Client;
import fr.bagni.backend.entity.Utilisateur;
import fr.bagni.backend.entity.enums.Role;
import fr.bagni.backend.exception.BusinessException;
import fr.bagni.backend.exception.ResourceNotFoundException;
import fr.bagni.backend.repository.PaysRepository;
import fr.bagni.backend.repository.UtilisateurRepository;
import fr.bagni.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PaysRepository paysRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterClientRequest request) {
        if (utilisateurRepository.existsByEmail(request.email())) {
            throw new BusinessException("Un compte existe déjà avec cet email");
        }

        var pays = paysRepository.findById(request.paysId())
                .orElseThrow(() -> new ResourceNotFoundException("Pays introuvable"));

        var client = new Client();
        client.setNom(request.nom());
        client.setPrenom(request.prenom());
        client.setEmail(request.email());
        client.setMotDePasse(passwordEncoder.encode(request.motDePasse()));
        client.setRole(Role.ROLE_CLIENT);
        client.setPays(pays);
        client.setDateInscription(LocalDate.now());

        utilisateurRepository.save(client);
        return buildAuthResponse(client);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.motDePasse()));

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        return buildAuthResponse(utilisateur);
    }

    private AuthResponse buildAuthResponse(Utilisateur utilisateur) {
        String token = jwtService.generateToken(utilisateur);
        return new AuthResponse(token, utilisateur.getEmail(), utilisateur.getNom(),
                utilisateur.getPrenom(), utilisateur.getRole().name());
    }
}
