const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());

// Configuration CORS plus permissive
app.use(cors({
  origin: ['http://localhost:3000', 'https://lsc-website.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Erreur de connexion à SQLite:', err.message);
  } else {
    console.log('Connecté à SQLite');
  }
});

// Import dynamique de node-fetch
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

const RECAPTCHA_SECRET = '6Le5JkUrAAAAAPUTbm2QtQKWwbPW7r0Us7us51qu'; // À remplacer par la vraie clé secrète

// Mot de passe admin (à personnaliser si besoin)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// Schéma de la table jeux
db.run(`CREATE TABLE IF NOT EXISTS jeux (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  description TEXT,
  date_debut TEXT,
  date_fin TEXT,
  banniere TEXT,
  age_minimum INTEGER DEFAULT 18,
  lots TEXT
)`);

// Schéma de la table participants
db.run(`CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jeu_id INTEGER,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  genre TEXT,
  date_naissance TEXT,
  date_participation TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jeu_id) REFERENCES jeux(id)
)`);

// Ajouter un jeu
app.post('/api/jeux', (req, res) => {
  const { titre, description, date_debut, date_fin, banniere, age_minimum, lots } = req.body;
  const lotsJson = JSON.stringify(lots || []);
  
  db.run(
    'INSERT INTO jeux (titre, description, date_debut, date_fin, banniere, age_minimum, lots) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [titre, description, date_debut, date_fin, banniere, age_minimum || 18, lotsJson],
    function(err) {
      if (err) {
        res.status(500).json({ success: false, error: err.message });
        return;
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Modifier un jeu
app.put('/api/jeux/:id', (req, res) => {
  const { titre, description, date_debut, date_fin, banniere, age_minimum, lots } = req.body;
  const lotsJson = JSON.stringify(lots || []);
  
  db.run(
    'UPDATE jeux SET titre = ?, description = ?, date_debut = ?, date_fin = ?, banniere = ?, age_minimum = ?, lots = ? WHERE id = ?',
    [titre, description, date_debut, date_fin, banniere, age_minimum || 18, lotsJson, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ success: false, error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Récupérer les jeux
app.get('/api/jeux', (req, res) => {
  db.all('SELECT * FROM jeux ORDER BY date_debut DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Convertir les lots JSON en objets
    const jeux = rows.map(jeu => ({
      ...jeu,
      lots: JSON.parse(jeu.lots || '[]')
    }));
    res.json(jeux);
  });
});

// Participer à un jeu
app.post('/api/participer', (req, res) => {
  const { jeu_id, nom, prenom, email, telephone, genre, date_naissance, antiBotAnswer } = req.body;

  // Vérification question anti-robot
  if (!antiBotAnswer || antiBotAnswer.trim() !== '7') {
    return res.status(400).json({ success: false, error: 'Merci de répondre correctement à la question anti-robot.' });
  }

  // Vérifier l'âge minimum
  if (date_naissance) {
    const age = new Date().getFullYear() - new Date(date_naissance).getFullYear();
    db.get('SELECT age_minimum FROM jeux WHERE id = ?', [jeu_id], (err, jeu) => {
      if (err) {
        res.status(500).json({ success: false, error: err.message });
        return;
      }
      if (age < (jeu.age_minimum || 18)) {
        res.status(400).json({ success: false, error: `Vous devez avoir au moins ${jeu.age_minimum || 18} ans pour participer.` });
        return;
      }
      createParticipation();
    });
  } else {
    createParticipation();
  }

  function createParticipation() {
    // Vérifier si déjà participé
    db.get('SELECT id FROM participants WHERE jeu_id = ? AND email = ?', [jeu_id, email], (err, row) => {
      if (err) {
        res.status(500).json({ success: false, error: err.message });
        return;
      }
      if (row) {
        res.status(400).json({ success: false, error: 'Vous avez déjà participé à ce jeu concours.' });
        return;
      }

      // Créer la participation
      db.run(
        'INSERT INTO participants (jeu_id, nom, prenom, email, telephone, genre, date_naissance) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [jeu_id, nom, prenom, email, telephone, genre, date_naissance],
        function(err) {
          if (err) {
            res.status(500).json({ success: false, error: err.message });
            return;
          }
          res.json({ success: true, id: this.lastID });
        }
      );
    });
  }
});

// Récupérer les participants d'un jeu
app.get('/api/participants/:jeuId', (req, res) => {
  db.all(
    'SELECT * FROM participants WHERE jeu_id = ? ORDER BY date_participation DESC',
    [req.params.jeuId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Récupérer les statistiques
app.get('/api/stats', (req, res) => {
  db.all('SELECT * FROM participants', [], (err, participants) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const stats = {
      totalParticipants: participants.length,
      hommes: 0,
      femmes: 0,
      ageMoyen: 0,
      participantsParJeu: {},
      participationParJour: {}
    };

    let totalAge = 0;
    let nbAge = 0;
    participants.forEach(p => {
      // Genre
      if (p.genre === 'M') stats.hommes++;
      if (p.genre === 'F') stats.femmes++;

      // Âge
      if (p.date_naissance) {
        const birth = new Date(p.date_naissance);
        if (!isNaN(birth.getTime())) {
          const now = new Date();
          let age = now.getFullYear() - birth.getFullYear();
          const m = now.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
          if (age > 0 && age < 120) { // filtre valeurs aberrantes
            totalAge += age;
            nbAge++;
          }
        }
      }

      // Participants par jeu
      if (!stats.participantsParJeu[p.jeu_id]) {
        stats.participantsParJeu[p.jeu_id] = 0;
      }
      stats.participantsParJeu[p.jeu_id]++;

      // Participation par jour
      const date = new Date(p.date_participation).toLocaleDateString();
      if (!stats.participationParJour[date]) {
        stats.participationParJour[date] = 0;
      }
      stats.participationParJour[date]++;
    });

    stats.ageMoyen = nbAge > 0 ? (totalAge / nbAge) : null;
    res.json(stats);
  });
});

app.post('/api/admin/stats', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD && password !== 'admin') {
    return res.status(401).json({ error: 'Mot de passe admin incorrect.' });
  }
  db.all('SELECT * FROM participants', [], (err, participants) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const stats = {
      totalParticipants: participants.length,
      hommes: 0,
      femmes: 0,
      ageMoyen: 0,
      participantsParJeu: {},
      participationParJour: {}
    };
    let totalAge = 0;
    let nbAge = 0;
    participants.forEach(p => {
      if (p.genre === 'M') stats.hommes++;
      if (p.genre === 'F') stats.femmes++;
      if (p.date_naissance) {
        const birth = new Date(p.date_naissance);
        if (!isNaN(birth.getTime())) {
          const now = new Date();
          let age = now.getFullYear() - birth.getFullYear();
          const m = now.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
          if (age > 0 && age < 120) {
            totalAge += age;
            nbAge++;
          }
        }
      }
      if (!stats.participantsParJeu[p.jeu_id]) {
        stats.participantsParJeu[p.jeu_id] = 0;
      }
      stats.participantsParJeu[p.jeu_id]++;
      const date = new Date(p.date_participation).toLocaleDateString();
      if (!stats.participationParJour[date]) {
        stats.participationParJour[date] = 0;
      }
      stats.participationParJour[date]++;
    });
    stats.ageMoyen = nbAge > 0 ? (totalAge / nbAge) : null;
    res.json(stats);
  });
});

// Connexion admin
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Mot de passe incorrect' });
  }
});

// Liste des jeux (admin)
app.post('/api/admin/jeux/list', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Mot de passe admin incorrect.' });
  db.all('SELECT * FROM jeux ORDER BY date_debut DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const jeux = rows.map(jeu => ({ ...jeu, lots: JSON.parse(jeu.lots || '[]') }));
    res.json(jeux);
  });
});

// Ajouter un jeu (admin)
app.post('/api/admin/jeux', (req, res) => {
  const { password, titre, description, date_debut, date_fin, banniere, age_minimum, lots } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Mot de passe admin incorrect.' });
  const lotsJson = JSON.stringify(lots || []);
  db.run(
    'INSERT INTO jeux (titre, description, date_debut, date_fin, banniere, age_minimum, lots) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [titre, description, date_debut, date_fin, banniere, age_minimum || 18, lotsJson],
    function(err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Modifier un jeu (admin)
app.post('/api/admin/jeux/edit', (req, res) => {
  const { password, id, titre, description, date_debut, date_fin, banniere, age_minimum, lots } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Mot de passe admin incorrect.' });
  const lotsJson = JSON.stringify(lots || []);
  db.run(
    'UPDATE jeux SET titre = ?, description = ?, date_debut = ?, date_fin = ?, banniere = ?, age_minimum = ?, lots = ? WHERE id = ?',
    [titre, description, date_debut, date_fin, banniere, age_minimum || 18, lotsJson, id],
    function(err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

// Supprimer un jeu (admin)
app.post('/api/admin/jeux/delete', (req, res) => {
  const { password, id } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Mot de passe admin incorrect.' });
  db.run('DELETE FROM jeux WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

// Liste des participants d'un jeu (admin)
app.post('/api/admin/participants', (req, res) => {
  const { password, jeu_id } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Mot de passe admin incorrect.' });
  db.all('SELECT * FROM participants WHERE jeu_id = ? ORDER BY date_participation DESC', [jeu_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 