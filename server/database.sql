-- Table des gagnants
CREATE TABLE IF NOT EXISTS gagnants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jeu_id INTEGER NOT NULL,
  participant_id INTEGER NOT NULL,
  date_tirage DATETIME NOT NULL,
  FOREIGN KEY (jeu_id) REFERENCES jeux(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  UNIQUE(jeu_id)
); 