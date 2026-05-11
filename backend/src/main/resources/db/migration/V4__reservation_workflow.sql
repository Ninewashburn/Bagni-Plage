ALTER TABLE reservation
    ADD COLUMN traite_par_id BIGINT REFERENCES concessionnaire(utilisateur_id),
    ADD COLUMN date_traitement TIMESTAMP,
    ADD COLUMN motif_refus TEXT,
    ADD COLUMN paiement_reference VARCHAR(80),
    ADD COLUMN paiement_statut VARCHAR(40),
    ADD COLUMN remboursement_reference VARCHAR(80),
    ADD COLUMN remboursement_statut VARCHAR(40);

UPDATE reservation
SET paiement_statut = 'CAPTURE_SIMULEE'
WHERE paiement_statut IS NULL;
