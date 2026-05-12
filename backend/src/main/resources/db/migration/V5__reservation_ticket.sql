ALTER TABLE reservation
    ADD COLUMN ticket_code VARCHAR(40),
    ADD COLUMN ticket_token VARCHAR(120),
    ADD COLUMN ticket_statut VARCHAR(30),
    ADD COLUMN ticket_emis_le TIMESTAMP,
    ADD COLUMN ticket_utilise_le TIMESTAMP;

CREATE UNIQUE INDEX idx_reservation_ticket_code
    ON reservation(ticket_code)
    WHERE ticket_code IS NOT NULL;
