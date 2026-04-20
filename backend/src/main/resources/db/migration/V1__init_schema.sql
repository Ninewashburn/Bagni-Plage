-- Pays
CREATE TABLE pays (
    id   BIGSERIAL PRIMARY KEY,
    nom  VARCHAR(100) NOT NULL UNIQUE
);

-- Utilisateur (table mère, héritage JOINED)
CREATE TABLE utilisateur (
    id          BIGSERIAL PRIMARY KEY,
    nom         VARCHAR(100)        NOT NULL,
    prenom      VARCHAR(100)        NOT NULL,
    email       VARCHAR(255)        NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255)       NOT NULL,
    role        VARCHAR(30)         NOT NULL
);

-- Concessionnaire
CREATE TABLE concessionnaire (
    utilisateur_id BIGINT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Client
CREATE TABLE client (
    utilisateur_id   BIGINT    PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    pays_id          BIGINT    REFERENCES pays(id),
    date_inscription DATE      NOT NULL DEFAULT CURRENT_DATE
);

-- Lien de parenté client / concessionnaire
CREATE TABLE lien_parente (
    id                BIGSERIAL PRIMARY KEY,
    client_id         BIGINT      NOT NULL REFERENCES client(utilisateur_id) ON DELETE CASCADE,
    type_parente      VARCHAR(50) NOT NULL,
    reduction_pourcent INT        NOT NULL CHECK (reduction_pourcent BETWEEN 0 AND 100)
);

-- File de parasols (numérotée 1-8, 1 = bord mer)
CREATE TABLE file_plage (
    id              BIGSERIAL      PRIMARY KEY,
    numero          SMALLINT       NOT NULL UNIQUE CHECK (numero BETWEEN 1 AND 8),
    prix_journalier NUMERIC(10, 2) NOT NULL
);

-- Parasols (1-36 par file)
CREATE TABLE parasol (
    id                BIGSERIAL PRIMARY KEY,
    numero_emplacement SMALLINT  NOT NULL CHECK (numero_emplacement BETWEEN 1 AND 36),
    file_id           BIGINT     NOT NULL REFERENCES file_plage(id) ON DELETE CASCADE,
    UNIQUE (numero_emplacement, file_id)
);

-- Réservation
CREATE TABLE reservation (
    id           BIGSERIAL      PRIMARY KEY,
    client_id    BIGINT         NOT NULL REFERENCES client(utilisateur_id),
    equipement   VARCHAR(30)    NOT NULL,
    date_debut   DATE           NOT NULL,
    date_fin     DATE           NOT NULL,
    montant_paye NUMERIC(10, 2) NOT NULL,
    statut       VARCHAR(20)    NOT NULL DEFAULT 'EN_ATTENTE',
    remarques    TEXT,
    CHECK (date_fin >= date_debut)
);

-- Table de jointure réservation ↔ parasol
CREATE TABLE reservation_parasol (
    reservation_id BIGINT NOT NULL REFERENCES reservation(id) ON DELETE CASCADE,
    parasol_id     BIGINT NOT NULL REFERENCES parasol(id),
    PRIMARY KEY (reservation_id, parasol_id)
);

-- Index utiles
CREATE INDEX idx_reservation_statut    ON reservation(statut);
CREATE INDEX idx_reservation_dates     ON reservation(date_debut, date_fin);
CREATE INDEX idx_reservation_client    ON reservation(client_id);
CREATE INDEX idx_parasol_file          ON parasol(file_id);
CREATE INDEX idx_client_pays           ON client(pays_id);
