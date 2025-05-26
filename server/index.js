const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;
const ADMIN_PASSWORD = 'saintclaude2024'; // À changer pour plus de sécurité

app.use(cors());
app.use(bodyParser.json());

// Initialisation de la base de données
const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('Erreur ouverture DB:', err.message);
  } else {
    console.log('Connecté à SQLite');
  }
});

// Création des tables si elles n'existent pas
const createTables = () => {
  db.run(`CREATE TABLE IF NOT EXISTS jeux (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    description TEXT,
    date_debut TEXT,
    date_fin TEXT,
    banniere TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    jeu_id INTEGER,
    date_participation TEXT,
    FOREIGN KEY (jeu_id) REFERENCES jeux(id)
  )`);
};
createTables();

// --- ROUTES PUBLICS ---
// Liste des jeux concours
app.get('/api/jeux', (req, res) => {
  db.all('SELECT * FROM jeux', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Participer à un jeu concours
app.post('/api/participer', (req, res) => {
  const { nom, prenom, email, telephone, jeu_id } = req.body;
  if (!nom || !prenom || !email || !jeu_id) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }
  // Vérifier la double participation
  db.get('SELECT * FROM participants WHERE email = ? AND jeu_id = ?', [email, jeu_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      return res.status(400).json({ error: 'Vous avez déjà participé à ce jeu concours.' });
    }
    const date_participation = new Date().toISOString();
    db.run(
      'INSERT INTO participants (nom, prenom, email, telephone, jeu_id, date_participation) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, telephone, jeu_id, date_participation],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });
});

// --- ROUTES ADMIN ---
// Authentification admin simple
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Mot de passe incorrect' });
  }
});

// Middleware d'authentification admin (à améliorer pour production)
function checkAdmin(req, res, next) {
  console.log('checkAdmin req.body:', req.body);
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Non autorisé' });
  }
}

// Ajouter un jeu concours (admin)
app.post('/api/admin/jeux', checkAdmin, (req, res) => {
  const { titre, description, date_debut, date_fin, banniere } = req.body;
  if (!titre) return res.status(400).json({ error: 'Titre obligatoire' });
  db.run(
    'INSERT INTO jeux (titre, description, date_debut, date_fin, banniere) VALUES (?, ?, ?, ?, ?)',
    [titre, description, date_debut, date_fin, banniere],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Liste des participants à un jeu (admin)
app.post('/api/admin/participants', checkAdmin, (req, res) => {
  const { jeu_id } = req.body;
  db.all('SELECT * FROM participants WHERE jeu_id = ?', [jeu_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Lister tous les jeux (admin)
app.post('/api/admin/jeux/list', checkAdmin, (req, res) => {
  db.all('SELECT * FROM jeux', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Modifier un jeu concours (admin)
app.post('/api/admin/jeux/edit', checkAdmin, (req, res) => {
  const { id, titre, description, date_debut, date_fin, banniere } = req.body;
  if (!id || !titre) return res.status(400).json({ error: 'ID et titre obligatoires' });
  db.run(
    'UPDATE jeux SET titre = ?, description = ?, date_debut = ?, date_fin = ?, banniere = ? WHERE id = ?',
    [titre, description, date_debut, date_fin, banniere, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Supprimer un jeu concours (admin, optionnel)
app.post('/api/admin/jeux/delete', checkAdmin, (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID obligatoire' });
  db.run('DELETE FROM jeux WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run('DELETE FROM participants WHERE jeu_id = ?', [id], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
}); 