package fr.bagni.backend.service;

import fr.bagni.backend.dto.response.PaysResponse;
import fr.bagni.backend.repository.PaysRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaysService {

    private final PaysRepository paysRepository;

    public List<PaysResponse> findAll() {
        return paysRepository.findAllByOrderByNomAsc().stream()
                .map(p -> new PaysResponse(p.getId(), p.getNom()))
                .toList();
    }
}
