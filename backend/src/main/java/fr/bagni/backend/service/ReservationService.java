package fr.bagni.backend.service;

import fr.bagni.backend.dto.request.ReservationRequest;
import fr.bagni.backend.dto.response.ReservationResponse;
import fr.bagni.backend.dto.response.ReservationTicketResponse;
import fr.bagni.backend.entity.Client;
import fr.bagni.backend.entity.Concessionnaire;
import fr.bagni.backend.entity.Parasol;
import fr.bagni.backend.entity.Reservation;
import fr.bagni.backend.entity.enums.Statut;
import fr.bagni.backend.exception.BusinessException;
import fr.bagni.backend.exception.ResourceNotFoundException;
import fr.bagni.backend.repository.ClientRepository;
import fr.bagni.backend.repository.ConcessionnaireRepository;
import fr.bagni.backend.repository.ParasolRepository;
import fr.bagni.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.Charset;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private static final Charset PDF_CHARSET = Charset.forName("windows-1252");

    private final ReservationRepository reservationRepository;
    private final ClientRepository clientRepository;
    private final ParasolRepository parasolRepository;
    private final ConcessionnaireRepository concessionnaireRepository;
    private final ClientService clientService;
    private final ParasolService parasolService;
    private final TarificationService tarificationService;

    public Page<ReservationResponse> findAll(@NonNull Pageable pageable) {
        return reservationRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<ReservationResponse> findByStatut(@NonNull Statut statut, @NonNull Pageable pageable) {
        return reservationRepository.findByStatut(statut, pageable).map(this::toResponse);
    }

    public Page<ReservationResponse> findPending(@NonNull Pageable pageable) {
        return reservationRepository.findByStatut(Statut.EN_ATTENTE, pageable).map(this::toResponse);
    }

    public List<ReservationResponse> findByClient(@NonNull Long clientId) {
        return reservationRepository.findByClientId(clientId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReservationResponse> findByClientEmail(String email) {
        var client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
        return findByClient(requireId(client.getId(), "clientId"));
    }

    public List<ReservationResponse> findForPlanning(@NonNull LocalDate from, @NonNull LocalDate to) {
        return reservationRepository.findForPlanning(from, to).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReservationResponse create(ReservationRequest request, String clientEmail) {
        var client = clientRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
        return createForClient(request, client);
    }

    @Transactional
    public ReservationResponse createForClient(ReservationRequest request) {
        if (request.clientId() == null) {
            throw new BusinessException("Le client est obligatoire pour une reservation saisie par le concessionnaire");
        }
        var clientId = requireId(request.clientId(), "Le client");
        var client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
        return createForClient(request, client);
    }

    private ReservationResponse createForClient(ReservationRequest request, Client client) {
        var dateDebut = requireDate(request.dateDebut(), "dateDebut");
        var dateFin = requireDate(request.dateFin(), "dateFin");
        var equipement = Objects.requireNonNull(request.equipement(), "equipement obligatoire");
        var parasolIds = deduplicate(requireIds(request.parasolIds(), "parasolIds"));
        var parasols = parasolRepository.findAllByIdForUpdate(parasolIds);
        if (parasols.size() != parasolIds.size()) {
            throw new ResourceNotFoundException("Un ou plusieurs parasols introuvables");
        }

        validateDates(dateDebut, dateFin);
        validateAvailability(parasolIds, dateDebut, dateFin);

        var montant = tarificationService.calculerMontant(
                client, parasols, equipement, dateDebut, dateFin);

        var reservation = Reservation.builder()
                .client(client)
                .parasols(parasols)
                .equipement(equipement)
                .dateDebut(dateDebut)
                .dateFin(dateFin)
                .montantPaye(montant)
                .statut(Statut.EN_ATTENTE)
                .remarques(request.remarques())
                .paiementReference("PAY-SIM-" + UUID.randomUUID())
                .paiementStatut("CAPTURE_SIMULEE")
                .remboursementStatut("NON_REQUIS")
                .build();

        return toResponse(reservationRepository.save(Objects.requireNonNull(reservation)));
    }

    public byte[] generateInvoicePdf(Long id, String userEmail, boolean concessionnaire) {
        var reservation = getOrThrow(id);
        if (!concessionnaire && !reservation.getClient().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("Facture non accessible");
        }
        return buildInvoicePdf(reservation);
    }

    @Transactional
    public ReservationResponse validate(Long id, String concessionnaireEmail) {
        var reservation = getOrThrow(id);
        if (reservation.getStatut() != Statut.EN_ATTENTE) {
            throw new BusinessException("Seules les reservations en attente peuvent etre validees");
        }
        reservation.setTraitePar(findConcessionnaire(concessionnaireEmail));
        reservation.setDateTraitement(LocalDateTime.now());
        reservation.setMotifRefus(null);
        reservation.setRemboursementStatut("NON_REQUIS");
        reservation.setStatut(Statut.VALIDEE);
        issueTicket(reservation);
        return toResponse(reservationRepository.save(Objects.requireNonNull(reservation)));
    }

    @Transactional
    public ReservationResponse refuse(Long id, String concessionnaireEmail, String motif) {
        var reservation = getOrThrow(id);
        if (reservation.getStatut() != Statut.EN_ATTENTE) {
            throw new BusinessException("Seules les reservations en attente peuvent etre refusees");
        }
        reservation.setTraitePar(findConcessionnaire(concessionnaireEmail));
        reservation.setDateTraitement(LocalDateTime.now());
        reservation.setMotifRefus(blankToNull(motif));
        reservation.setRemboursementReference("REF-SIM-" + UUID.randomUUID());
        reservation.setRemboursementStatut("REMBOURSE_SIMULE");
        if (reservation.getTicketCode() != null) {
            reservation.setTicketStatut("ANNULE");
        }
        reservation.setStatut(Statut.REFUSEE);
        return toResponse(reservationRepository.save(Objects.requireNonNull(reservation)));
    }

    @Transactional
    public ReservationTicketResponse getTicket(Long id, String userEmail, boolean concessionnaire) {
        var reservation = getOrThrow(id);
        assertTicketAccess(reservation, userEmail, concessionnaire);
        if (reservation.getStatut() == Statut.VALIDEE && reservation.getTicketCode() == null) {
            issueTicket(reservation);
            reservationRepository.save(Objects.requireNonNull(reservation));
        }
        return toTicketResponse(reservation);
    }

    @Transactional
    public ReservationTicketResponse checkIn(String ticketCode, String concessionnaireEmail) {
        findConcessionnaire(concessionnaireEmail);
        var reservation = reservationRepository.findByTicketCode(requireTicketCode(ticketCode))
                .orElseThrow(() -> new ResourceNotFoundException("Ticket introuvable"));
        if (reservation.getStatut() != Statut.VALIDEE) {
            throw new BusinessException("Ce ticket n'est pas valide");
        }
        if ("UTILISE".equals(reservation.getTicketStatut())) {
            throw new BusinessException("Ce ticket a deja ete utilise");
        }
        if (reservation.getDateFin().isBefore(LocalDate.now())) {
            reservation.setTicketStatut("EXPIRE");
            reservationRepository.save(Objects.requireNonNull(reservation));
            throw new BusinessException("Ce ticket est expire");
        }
        if (reservation.getTicketCode() == null) {
            issueTicket(reservation);
        }
        reservation.setTicketStatut("UTILISE");
        reservation.setTicketUtiliseLe(LocalDateTime.now());
        return toTicketResponse(reservationRepository.save(Objects.requireNonNull(reservation)));
    }

    public ReservationTicketResponse findTicketByCode(String ticketCode, String concessionnaireEmail) {
        findConcessionnaire(concessionnaireEmail);
        var reservation = reservationRepository.findByTicketCode(requireTicketCode(ticketCode))
                .orElseThrow(() -> new ResourceNotFoundException("Ticket introuvable"));
        return toTicketResponse(reservation);
    }

    private void validateDates(@NonNull LocalDate dateDebut, @NonNull LocalDate dateFin) {
        if (dateFin.isBefore(dateDebut)) {
            throw new BusinessException("La date de fin doit etre apres la date de debut");
        }
        LocalDate debutSaison = LocalDate.of(dateDebut.getYear(), Month.MAY, 1);
        LocalDate finSaison = LocalDate.of(dateDebut.getYear(), Month.SEPTEMBER, 15);
        if (dateDebut.isBefore(debutSaison) || dateFin.isAfter(finSaison) || dateFin.getYear() != dateDebut.getYear()) {
            throw new BusinessException("La reservation doit etre comprise entre le 1er mai et le 15 septembre");
        }
    }

    private void validateAvailability(@NonNull List<Long> parasolIds, @NonNull LocalDate dateDebut, @NonNull LocalDate dateFin) {
        var conflits = reservationRepository.findConflictingParasolIds(parasolIds, dateDebut, dateFin, Statut.REFUSEE);
        if (!conflits.isEmpty()) {
            throw new BusinessException("Un ou plusieurs parasols sont deja reserves sur cette periode: " + conflits);
        }
    }

    private @NonNull List<Long> deduplicate(@NonNull List<Long> ids) {
        return new ArrayList<>(new LinkedHashSet<>(ids));
    }

    private Concessionnaire findConcessionnaire(String email) {
        return concessionnaireRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Concessionnaire introuvable"));
    }

    private Reservation getOrThrow(Long id) {
        var reservationId = requireId(id, "reservationId");
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation introuvable"));
    }

    private @NonNull Long requireId(Long id, String label) {
        return Objects.requireNonNull(id, label + " obligatoire");
    }

    private @NonNull LocalDate requireDate(LocalDate date, String label) {
        return Objects.requireNonNull(date, label + " obligatoire");
    }

    private @NonNull List<Long> requireIds(List<Long> ids, String label) {
        return Objects.requireNonNull(ids, label + " obligatoire");
    }

    private ReservationResponse toResponse(Reservation r) {
        var parasols = r.getParasols().stream()
                .map(parasolService::toParasolResponse)
                .toList();
        return new ReservationResponse(r.getId(), clientService.toResponse(r.getClient()),
                parasols, r.getEquipement(), r.getDateDebut(), r.getDateFin(),
                r.getMontantPaye(), r.getStatut(), r.getRemarques(), r.getDateTraitement(),
                r.getMotifRefus(), r.getPaiementReference(), r.getPaiementStatut(),
                r.getRemboursementReference(), r.getRemboursementStatut(), r.getTicketCode(),
                r.getTicketStatut(), r.getTicketEmisLe(), r.getTicketUtiliseLe());
    }

    private void assertTicketAccess(Reservation reservation, String userEmail, boolean concessionnaire) {
        if (!concessionnaire && !reservation.getClient().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("Ticket non accessible");
        }
    }

    private void issueTicket(Reservation reservation) {
        if (reservation.getTicketCode() != null) {
            if (!"UTILISE".equals(reservation.getTicketStatut())) {
                reservation.setTicketStatut("ACTIF");
            }
            return;
        }
        var idPart = reservation.getId() == null ? "TEMP" : reservation.getId().toString();
        var randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        reservation.setTicketCode("BAGNI-" + idPart + "-" + randomPart);
        reservation.setTicketToken(UUID.randomUUID().toString());
        reservation.setTicketStatut("ACTIF");
        reservation.setTicketEmisLe(LocalDateTime.now());
    }

    private ReservationTicketResponse toTicketResponse(Reservation reservation) {
        var parasols = reservation.getParasols().stream()
                .map(Parasol::getIdentifiant)
                .toList();
        var formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        var periode = reservation.getDateDebut().format(formatter) + " - " + reservation.getDateFin().format(formatter);
        var ticketCode = reservation.getTicketCode();
        var ticketToken = reservation.getTicketToken();
        var statut = reservation.getStatut() == Statut.VALIDEE
                ? nullToDash(reservation.getTicketStatut())
                : "EN_ATTENTE_VALIDATION";
        var payload = ticketCode == null || ticketToken == null
                ? null
                : "BAGNI:TICKET:" + ticketCode + ":" + ticketToken;
        return new ReservationTicketResponse(
                reservation.getId(),
                ticketCode,
                ticketToken,
                statut,
                reservation.getTicketEmisLe(),
                reservation.getTicketUtiliseLe(),
                payload,
                fullName(reservation.getClient()),
                periode,
                String.join(", ", parasols),
                equipmentLabel(reservation.getEquipement())
        );
    }

    private @NonNull String requireTicketCode(String ticketCode) {
        if (ticketCode == null || ticketCode.isBlank()) {
            throw new BusinessException("Le code ticket est obligatoire");
        }
        return Objects.requireNonNull(ticketCode.trim(), "ticketCode obligatoire");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private byte[] buildInvoicePdf(Reservation reservation) {
        var formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        var client = reservation.getClient();
        var parasolCodes = reservation.getParasols().stream()
                .map(Parasol::getIdentifiant)
                .toList();
        BigDecimal baseDaily = reservation.getParasols().stream()
                .map(parasol -> parasol.getFile().getPrixJournalier())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        var supplementJour = tarificationService.supplementEquipementJournalier(reservation.getEquipement());
        var nbJours = java.time.temporal.ChronoUnit.DAYS
                .between(reservation.getDateDebut(), reservation.getDateFin()) + 1;
        var baseTotal = baseDaily.multiply(BigDecimal.valueOf(nbJours));
        var equipmentTotal = supplementJour.multiply(BigDecimal.valueOf(nbJours));
        var grossTotal = baseTotal.add(equipmentTotal);
        var total = nullToZero(reservation.getMontantPaye());
        var discount = grossTotal.subtract(total);
        if (discount.signum() < 0) {
            discount = BigDecimal.ZERO;
        }

        var stream = new StringBuilder();
        rect(stream, 0, 792, 595, 50, "4B2F11");
        rect(stream, 0, 742, 595, 50, "FBF5E9");
        logo(stream, 54, 817);
        text(stream, "Bagni Plage", 82, 806, 20, true, "FBF5E9");
        text(stream, "Reçu de paiement sandbox", 82, 786, 9, false, "F4D7BF");
        text(stream, "FACTURE", 54, 710, 28, true, "2B1A05");
        text(stream, "Réservation #" + reservation.getId(), 54, 690, 11, false, "7C5C39");
        textRight(stream, "Émise le " + LocalDate.now().format(formatter), 540, 710, 10, false, "7C5C39");
        badge(stream, paymentStatusLabel(reservation.getPaiementStatut()), 400, 682);

        card(stream, 54, 570, 220, 84, "Client");
        text(stream, fullName(client), 70, 620, 12, true, "2B1A05");
        text(stream, client.getEmail(), 70, 602, 9, false, "5B4732");
        text(stream, client.getPays() == null ? "Pays non renseigne" : client.getPays().getNom(), 70, 586, 9, false, "5B4732");

        card(stream, 320, 570, 220, 84, "Sejour");
        text(stream, reservation.getDateDebut().format(formatter) + " - " + reservation.getDateFin().format(formatter), 336, 620, 12, true, "2B1A05");
        text(stream, nbJours + " jour(s) de location", 336, 602, 9, false, "5B4732");
        text(stream, "Parasol(s) " + String.join(", ", parasolCodes), 336, 586, 9, false, "5B4732");

        text(stream, "Détails de facturation", 54, 530, 14, true, "2B1A05");
        rect(stream, 54, 497, 486, 26, "EADAC0");
        text(stream, "Libellé", 70, 506, 9, true, "4B2F11");
        text(stream, "Prix/jour", 330, 506, 9, true, "4B2F11");
        text(stream, "Jours", 405, 506, 9, true, "4B2F11");
        textRight(stream, "Total", 524, 506, 9, true, "4B2F11");

        int y = 470;
        invoiceRow(stream, y, "Emplacement plage - " + String.join(", ", parasolCodes),
                money(baseDaily), String.valueOf(nbJours), money(baseTotal));
        y -= 30;
        invoiceRow(stream, y, "Mobilier - " + equipmentLabel(reservation.getEquipement()),
                money(supplementJour), String.valueOf(nbJours), money(equipmentTotal));
        y -= 30;
        if (discount.signum() > 0) {
            invoiceRow(stream, y, "Réductions appliquées", "", "", "-" + money(discount));
            y -= 30;
        }

        line(stream, 54, y + 14, 540, y + 14, "EADAC0");
        text(stream, "Montant total payé", 332, y - 12, 12, true, "2B1A05");
        textRight(stream, money(total), 540, y - 12, 18, true, "C8553D");

        card(stream, 54, 190, 486, 96, "Paiement");
        text(stream, "Prestataire", 70, 246, 8, true, "7C5C39");
        text(stream, "PayPal Sandbox", 170, 246, 9, false, "2B1A05");
        text(stream, "Reference", 70, 226, 8, true, "7C5C39");
        text(stream, nullToDash(reservation.getPaiementReference()), 170, 226, 8, false, "2B1A05");
        text(stream, "Statut", 70, 206, 8, true, "7C5C39");
        text(stream, paymentStatusLabel(reservation.getPaiementStatut()), 170, 206, 9, false, "2B1A05");

        rect(stream, 54, 80, 486, 62, "FBF5E9");
        text(stream, "Merci pour votre réservation.", 70, 118, 11, true, "2B1A05");
        text(stream, "Facture émise après confirmation du paiement en ligne.", 70, 100, 8, false, "5B4732");
        text(stream, "Bagni Plage - Réservation de parasols et équipements de plage", 70, 54, 8, false, "7C5C39");

        return pdfDocument(stream.toString());
    }

    private void invoiceRow(StringBuilder stream, int y, String label, String unit, String quantity, String total) {
        line(stream, 54, y - 9, 540, y - 9, "EFE4D1");
        text(stream, label, 70, y, 9, false, "2B1A05");
        textRight(stream, unit, 386, y, 9, false, "5B4732");
        textRight(stream, quantity, 430, y, 9, false, "5B4732");
        textRight(stream, total, 524, y, 9, true, "2B1A05");
    }

    private void badge(StringBuilder stream, String label, int x, int y) {
        rect(stream, x, y, 140, 24, "DFF0E5");
        text(stream, label, x + 12, y + 8, 8, true, "2F6B45");
    }

    private void card(StringBuilder stream, int x, int y, int width, int height, String title) {
        rect(stream, x, y, width, height, "FBF5E9");
        line(stream, x, y + height, x + width, y + height, "EADAC0");
        text(stream, title.toUpperCase(Locale.ROOT), x + 16, y + height - 22, 8, true, "7C5C39");
    }

    private void logo(StringBuilder stream, int centerX, int centerY) {
        circle(stream, centerX, centerY, 13, "C8553D");
        line(stream, centerX, centerY - 7, centerX, centerY + 7, "FBF5E9", 1.2);
        line(stream, centerX, centerY, centerX - 8, centerY + 4, "FBF5E9", 1.2);
        line(stream, centerX, centerY, centerX + 8, centerY + 4, "FBF5E9", 1.2);
        line(stream, centerX - 8, centerY + 4, centerX + 8, centerY + 4, "FBF5E9", 1.2);
        line(stream, centerX, centerY - 7, centerX + 5, centerY - 10, "FBF5E9", 1.2);
    }

    private void circle(StringBuilder stream, int centerX, int centerY, int radius, String hexColor) {
        double k = radius * 0.5522847498;
        stream.append(color(hexColor, false))
                .append(centerX).append(' ').append(centerY + radius).append(" m\n")
                .append(format(centerX + k)).append(' ').append(centerY + radius).append(' ')
                .append(centerX + radius).append(' ').append(format(centerY + k)).append(' ')
                .append(centerX + radius).append(' ').append(centerY).append(" c\n")
                .append(centerX + radius).append(' ').append(format(centerY - k)).append(' ')
                .append(format(centerX + k)).append(' ').append(centerY - radius).append(' ')
                .append(centerX).append(' ').append(centerY - radius).append(" c\n")
                .append(format(centerX - k)).append(' ').append(centerY - radius).append(' ')
                .append(centerX - radius).append(' ').append(format(centerY - k)).append(' ')
                .append(centerX - radius).append(' ').append(centerY).append(" c\n")
                .append(centerX - radius).append(' ').append(format(centerY + k)).append(' ')
                .append(format(centerX - k)).append(' ').append(centerY + radius).append(' ')
                .append(centerX).append(' ').append(centerY + radius).append(" c\nf\n");
    }

    private void rect(StringBuilder stream, int x, int y, int width, int height, String hexColor) {
        stream.append(color(hexColor, false))
                .append(x).append(' ').append(y).append(' ')
                .append(width).append(' ').append(height).append(" re f\n");
    }

    private void line(StringBuilder stream, int x1, int y1, int x2, int y2, String hexColor) {
        line(stream, x1, y1, x2, y2, hexColor, 0.7);
    }

    private void line(StringBuilder stream, int x1, int y1, int x2, int y2, String hexColor, double width) {
        stream.append(color(hexColor, true))
                .append(format(width)).append(" w\n")
                .append(x1).append(' ').append(y1).append(" m ")
                .append(x2).append(' ').append(y2).append(" l S\n");
    }

    private void text(StringBuilder stream, String value, int x, int y, int size, boolean bold, String hexColor) {
        stream.append("BT\n")
                .append(color(hexColor, false))
                .append(bold ? "/F2 " : "/F1 ")
                .append(size)
                .append(" Tf\n")
                .append(x)
                .append(' ')
                .append(y)
                .append(" Td\n(")
                .append(pdfText(value))
                .append(") Tj\nET\n");
    }

    private void textRight(StringBuilder stream, String value, int rightX, int y, int size, boolean bold, String hexColor) {
        int x = Math.max(54, rightX - approximateTextWidth(value, size, bold));
        text(stream, value, x, y, size, bold, hexColor);
    }

    private int approximateTextWidth(String value, int size, boolean bold) {
        double factor = bold ? 0.58 : 0.53;
        return (int) Math.ceil(value.length() * size * factor);
    }

    private String format(double value) {
        return String.format(Locale.ROOT, "%.2f", value);
    }

    private String color(String hexColor, boolean strokeOrText) {
        int r = Integer.parseInt(hexColor.substring(0, 2), 16);
        int g = Integer.parseInt(hexColor.substring(2, 4), 16);
        int b = Integer.parseInt(hexColor.substring(4, 6), 16);
        return String.format(Locale.ROOT, "%.3f %.3f %.3f %s\n", r / 255d, g / 255d, b / 255d,
                strokeOrText ? "RG" : "rg");
    }

    private byte[] pdfDocument(String content) {
        var contentBytes = content.getBytes(PDF_CHARSET);
        var objects = List.of(
                "<< /Type /Catalog /Pages 2 0 R >>",
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
                "<< /Length " + contentBytes.length + " >>\nstream\n" + content + "endstream"
        );

        var pdf = new StringBuilder("%PDF-1.4\n");
        var offsets = new ArrayList<Integer>();
        for (int i = 0; i < objects.size(); i++) {
            offsets.add(pdf.toString().getBytes(PDF_CHARSET).length);
            pdf.append(i + 1).append(" 0 obj\n").append(objects.get(i)).append("\nendobj\n");
        }
        int xrefOffset = pdf.toString().getBytes(PDF_CHARSET).length;
        pdf.append("xref\n0 ").append(objects.size() + 1).append("\n");
        pdf.append("0000000000 65535 f \n");
        for (Integer offset : offsets) {
            pdf.append(String.format("%010d 00000 n \n", offset));
        }
        pdf.append("trailer\n<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\n");
        pdf.append("startxref\n").append(xrefOffset).append("\n%%EOF");
        return pdf.toString().getBytes(PDF_CHARSET);
    }

    private String pdfText(String value) {
        return value.replace('\u00a0', ' ')
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");
    }

    private String fullName(Client client) {
        return (nullToDash(client.getPrenom()) + " " + nullToDash(client.getNom())).trim();
    }

    private String equipmentLabel(fr.bagni.backend.entity.enums.Equipement equipement) {
        return switch (equipement) {
            case UN_LIT -> "1 lit inclus";
            case DEUX_LITS -> "2 lits";
            case UN_FAUTEUIL -> "1 fauteuil de réalisateur";
            case FAUTEUIL_ET_LIT -> "1 fauteuil + 1 lit";
            case DEUX_FAUTEUILS -> "2 fauteuils de réalisateur";
        };
    }

    private String paymentStatusLabel(String status) {
        if ("CAPTURE_SIMULEE".equals(status)) {
            return "Paiement capturé";
        }
        if ("NON_REQUIS".equals(status)) {
            return "Non requis";
        }
        return nullToDash(status).replace('_', ' ');
    }

    private String money(BigDecimal amount) {
        var formatter = NumberFormat.getNumberInstance(Locale.FRANCE);
        formatter.setMinimumFractionDigits(2);
        formatter.setMaximumFractionDigits(2);
        return formatter.format(nullToZero(amount)).replace('\u00a0', ' ') + " \u20ac";
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String nullToDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}
