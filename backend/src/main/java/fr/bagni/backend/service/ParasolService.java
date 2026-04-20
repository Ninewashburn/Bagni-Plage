package fr.bagni.backend.service;

import fr.bagni.backend.dto.response.FilePlageResponse;
import fr.bagni.backend.dto.response.ParasolResponse;
import fr.bagni.backend.entity.FilePlage;
import fr.bagni.backend.entity.Parasol;
import fr.bagni.backend.repository.FilePlageRepository;
import fr.bagni.backend.repository.ParasolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ParasolService {

    private final FilePlageRepository filePlageRepository;
    private final ParasolRepository parasolRepository;

    public List<FilePlageResponse> findAllFiles() {
        return filePlageRepository.findAll().stream()
                .map(this::toFilePlageResponse)
                .toList();
    }

    public List<ParasolResponse> findDisponibles(LocalDate dateDebut, LocalDate dateFin) {
        return parasolRepository.findDisponibles(dateDebut, dateFin).stream()
                .map(this::toParasolResponse)
                .toList();
    }

    public ParasolResponse toParasolResponse(Parasol parasol) {
        return new ParasolResponse(
                parasol.getId(),
                parasol.getNumeroEmplacement(),
                parasol.getFile().getNumero(),
                parasol.getIdentifiant()
        );
    }

    private FilePlageResponse toFilePlageResponse(FilePlage file) {
        List<ParasolResponse> parasols = file.getParasols().stream()
                .map(this::toParasolResponse)
                .toList();
        return new FilePlageResponse(file.getId(), file.getNumero(), file.getPrixJournalier(), parasols);
    }
}
