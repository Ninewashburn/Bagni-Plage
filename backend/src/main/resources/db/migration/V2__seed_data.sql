-- Pays européens courants (plage italienne)
INSERT INTO pays (nom) VALUES
    ('Allemagne'), ('Autriche'), ('Belgique'), ('Espagne'), ('France'),
    ('Italie'), ('Pays-Bas'), ('Pologne'), ('Portugal'), ('Royaume-Uni'),
    ('Suisse'), ('Autre');

-- Files de parasols (1 = bord mer = plus cher, 8 = plus loin = moins cher)
INSERT INTO file_plage (numero, prix_journalier) VALUES
    (1, 45.00),
    (2, 40.00),
    (3, 35.00),
    (4, 30.00),
    (5, 25.00),
    (6, 22.00),
    (7, 19.00),
    (8, 15.00);

-- Parasols : 36 par file (8 files = 288 parasols)
INSERT INTO parasol (numero_emplacement, file_id)
SELECT s.emplacement, f.id
FROM generate_series(1, 36) AS s(emplacement)
CROSS JOIN file_plage f;

-- Concessionnaire par défaut (mot de passe à changer en prod)
-- mot de passe : Admin1234! (bcrypt)
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role)
VALUES ('Rossi', 'Marco', 'admin@bagni-plage.it',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVsk0/bVFy',
        'ROLE_CONCESSIONNAIRE');

INSERT INTO concessionnaire (utilisateur_id)
SELECT id FROM utilisateur WHERE email = 'admin@bagni-plage.it';
