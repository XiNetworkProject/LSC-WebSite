import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUserShield, faChartBar, faGift, faUsers, faVenusMars, faBirthdayCake } from '@fortawesome/free-solid-svg-icons';
import config from '../config';
import './Admin.css';

function Admin() {
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [error, setError] = useState('');
  const [jeux, setJeux] = useState([]);
  const [loadingJeux, setLoadingJeux] = useState(false);
  const [addForm, setAddForm] = useState({ 
    titre: '', 
    description: '', 
    date_debut: '', 
    date_fin: '', 
    banniere: '',
    lots: [{ rang: 1, description: '', valeur: '' }],
    age_minimum: 18
  });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [participants, setParticipants] = useState([]);
  const [showParticipantsJeuId, setShowParticipantsJeuId] = useState(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [editJeu, setEditJeu] = useState(null);
  const [editForm, setEditForm] = useState({ 
    id: '', 
    titre: '', 
    description: '', 
    date_debut: '', 
    date_fin: '', 
    banniere: '',
    lots: [{ rang: 1, description: '', valeur: '' }],
    age_minimum: 18
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [stats, setStats] = useState({
    totalParticipants: 0,
    hommes: 0,
    femmes: 0,
    ageMoyen: 0,
    participantsParJeu: {},
    participationParJour: {}
  });
  const [statsError, setStatsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingParticipant, setDeletingParticipant] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Connexion admin
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    fetch(`${config.apiUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsLogged(true);
          setAdminPassword(password); // On mémorise le mot de passe admin
          setPassword('');
          fetchJeux(password);
        } else {
          setError(data.error || 'Erreur de connexion');
        }
      })
      .catch(() => setError('Erreur de connexion'));
  };

  // Récupérer les jeux concours
  const fetchJeux = (pwd) => {
    const pass = pwd || adminPassword;
    setLoadingJeux(true);
    fetch(`${config.apiUrl}/api/admin/jeux/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    })
      .then(res => res.json())
      .then(data => {
        setJeux(Array.isArray(data) ? data : []);
        setLoadingJeux(false);
        refreshStats();
      })
      .catch(() => setLoadingJeux(false));
  };

  // Ajouter un jeu concours
  const handleAddJeu = (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    if (!addForm.titre) {
      setAddError('Le titre est obligatoire');
      return;
    }
    fetch(`${config.apiUrl}/api/admin/jeux`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, password: adminPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAddSuccess('Jeu ajouté !');
          setAddForm({ titre: '', description: '', date_debut: '', date_fin: '', banniere: '', lots: [{ rang: 1, description: '', valeur: '' }], age_minimum: 18 });
          fetchJeux(adminPassword);
        } else {
          setAddError(data.error || 'Erreur lors de l\'ajout');
        }
      })
      .catch(() => setAddError('Erreur lors de l\'ajout'));
  };

  // Voir les participants d'un jeu
  const handleShowParticipants = (jeu_id) => {
    setParticipantsLoading(true);
    setShowParticipantsJeuId(jeu_id);
    fetchParticipants(jeu_id);
  };

  // Fonction pour récupérer les participants avec recherche
  const fetchParticipants = (jeu_id) => {
    fetch(`${config.apiUrl}/api/admin/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        jeu_id, 
        password: adminPassword,
        searchTerm: searchTerm.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        setParticipants(Array.isArray(data) ? data : []);
        setParticipantsLoading(false);
        refreshStats();
      })
      .catch(() => {
        setParticipants([]);
        setParticipantsLoading(false);
      });
  };

  // Supprimer un participant
  const handleDeleteParticipant = (participant_id) => {
    if (!window.confirm('Supprimer ce participant ?')) return;
    setDeletingParticipant(participant_id);
    
    fetch(`${config.apiUrl}/api/admin/participants/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id, password: adminPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchParticipants(showParticipantsJeuId);
          refreshStats();
        }
        setDeletingParticipant(null);
      })
      .catch(() => setDeletingParticipant(null));
  };

  // Gérer la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (showParticipantsJeuId) {
      fetchParticipants(showParticipantsJeuId);
    }
  };

  // Supprimer un jeu concours
  const handleDeleteJeu = (id) => {
    if (!window.confirm('Supprimer ce jeu ?')) return;
    fetch(`${config.apiUrl}/api/admin/jeux/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password: adminPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) fetchJeux(adminPassword);
      });
  };

  // Préparer la modification d'un jeu
  const handleEditJeu = (jeu) => {
    setEditJeu(jeu.id);
    setEditForm({
      id: jeu.id,
      titre: jeu.titre,
      description: jeu.description || '',
      date_debut: jeu.date_debut ? jeu.date_debut.substring(0, 10) : '',
      date_fin: jeu.date_fin ? jeu.date_fin.substring(0, 10) : '',
      banniere: jeu.banniere || '',
      lots: jeu.lots || [{ rang: 1, description: '', valeur: '' }],
      age_minimum: jeu.age_minimum || 18
    });
    setEditError('');
    setEditSuccess('');
  };

  // Enregistrer la modification
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    if (!editForm.titre) {
      setEditError('Le titre est obligatoire');
      return;
    }
    fetch(`${config.apiUrl}/api/admin/jeux/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, password: adminPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEditSuccess('Jeu modifié !');
          setEditJeu(null);
          fetchJeux(adminPassword);
        } else {
          setEditError(data.error || 'Erreur lors de la modification');
        }
      })
      .catch(() => setEditError('Erreur lors de la modification'));
  };

  const handleLogout = () => {
    setIsLogged(false);
    setAdminPassword('');
    setJeux([]);
    setParticipants([]);
    setShowParticipantsJeuId(null);
  };

  const handleAddLot = () => {
    setAddForm(prev => ({
      ...prev,
      lots: [...prev.lots, { rang: prev.lots.length + 1, description: '', valeur: '' }]
    }));
  };

  const handleRemoveLot = (index) => {
    setAddForm(prev => ({
      ...prev,
      lots: prev.lots.filter((_, i) => i !== index)
    }));
  };

  const handleLotChange = (index, field, value) => {
    setAddForm(prev => ({
      ...prev,
      lots: prev.lots.map((lot, i) => 
        i === index ? { ...lot, [field]: value } : lot
      )
    }));
  };

  const calculateStats = (participants) => {
    const stats = {
      totalParticipants: participants.length,
      hommes: 0,
      femmes: 0,
      ageMoyen: 0,
      participantsParJeu: {},
      participationParJour: {}
    };

    let totalAge = 0;
    participants.forEach(p => {
      // Genre
      if (p.genre === 'M') stats.hommes++;
      if (p.genre === 'F') stats.femmes++;

      // Âge
      if (p.date_naissance) {
        const age = new Date().getFullYear() - new Date(p.date_naissance).getFullYear();
        totalAge += age;
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

    stats.ageMoyen = totalAge / participants.length || 0;
    return stats;
  };

  const refreshStats = () => {
    fetch(`${config.apiUrl}/api/admin/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatsError(data.error);
          setStats({ totalParticipants: 0, hommes: 0, femmes: 0, ageMoyen: null, participantsParJeu: {}, participationParJour: {} });
        } else {
          setStatsError('');
          setStats(data);
        }
        console.log('Réponse stats:', data);
      })
      .catch(e => {
        setStatsError('Erreur lors de la récupération des stats');
        console.error('Erreur stats:', e);
      });
  };

  useEffect(() => {
    if (isLogged && adminPassword) {
      fetchJeux(adminPassword);
      fetch(`${config.apiUrl}/api/admin/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setStatsError(data.error);
            setStats({ totalParticipants: 0, hommes: 0, femmes: 0, ageMoyen: null, participantsParJeu: {}, participationParJour: {} });
          } else {
            setStatsError('');
            setStats(data);
          }
          console.log('Réponse stats:', data);
        })
        .catch(e => {
          setStatsError('Erreur lors de la récupération des stats');
          console.error('Erreur stats:', e);
        });
    }
    // eslint-disable-next-line
  }, [isLogged, adminPassword]);

  return (
    <div className="admin-container">
      {/* Barre latérale */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin LSC</h2>
          <p>Panneau de contrôle</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <i className="fas fa-chart-line"></i>
            Tableau de bord
          </button>

          <button
            className={`nav-item ${activeSection === 'jeux' ? 'active' : ''}`}
            onClick={() => setActiveSection('jeux')}
          >
            <i className="fas fa-gamepad"></i>
            Jeux concours
          </button>

          {showParticipantsJeuId && (
            <button
              className={`nav-item ${activeSection === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveSection('participants')}
            >
              <i className="fas fa-users"></i>
              Participants
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="admin-main">
        {!isLogged ? (
          <div className="login-container">
            <div className="login-box">
              <h2>Connexion Admin</h2>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
              </div>
              <button
                className="login-button"
                onClick={handleSubmit}
                disabled={loadingJeux}
              >
                {loadingJeux ? 'Connexion...' : 'Se connecter'}
              </button>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <header className="admin-header">
              <h1>
                {activeSection === 'dashboard' && 'Tableau de bord'}
                {activeSection === 'jeux' && 'Jeux concours'}
                {activeSection === 'participants' && 'Participants'}
              </h1>
              <button className="refresh-button" onClick={refreshStats}>
                <i className="fas fa-sync-alt"></i>
                Actualiser
              </button>
            </header>

            {activeSection === 'dashboard' && (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Participants</h3>
                  <div className="stat-value">{stats.totalParticipants}</div>
                </div>
                <div className="stat-card">
                  <h3>Jeux Actifs</h3>
                  <div className="stat-value">{stats.jeux_actifs}</div>
                </div>
                <div className="stat-card">
                  <h3>Participants Aujourd'hui</h3>
                  <div className="stat-value">{stats.participants_aujourdhui}</div>
                </div>
              </div>
            )}

            {activeSection === 'jeux' && (
              <div className="content-card">
                <div className="card-header">
                  <button className="add-button" onClick={() => setShowNewJeuForm(true)}>
                    <i className="fas fa-plus"></i>
                    Nouveau jeu concours
                  </button>
                </div>

                {loadingJeux ? (
                  <div className="loading-message">Chargement...</div>
                ) : jeux.length === 0 ? (
                  <div className="empty-message">Aucun jeu concours</div>
                ) : (
                  <div className="jeux-grid">
                    {jeux.map(jeu => (
                      <div key={jeu.id} className="jeu-card">
                        <h3>{jeu.titre}</h3>
                        <div className="jeu-info">
                          <div>
                            <i className="fas fa-calendar"></i>
                            Du {new Date(jeu.date_debut).toLocaleDateString()} au {new Date(jeu.date_fin).toLocaleDateString()}
                          </div>
                          <div>
                            <i className="fas fa-users"></i>
                            {jeu.participants_count} participants
                          </div>
                        </div>
                        <div className="jeu-actions">
                          <button
                            className="view-button"
                            onClick={() => handleShowParticipants(jeu.id)}
                          >
                            Voir participants
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteJeu(jeu.id)}
                            disabled={deletingJeuId === jeu.id}
                          >
                            {deletingJeuId === jeu.id ? 'Suppression...' : 'Supprimer'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'participants' && showParticipantsJeuId && (
              <div className="content-card">
                <div className="search-container">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Rechercher par nom ou prénom..."
                    className="search-input"
                  />
                </div>

                {participantsLoading ? (
                  <div className="loading-message">Chargement...</div>
                ) : participants.length === 0 ? (
                  <div className="empty-message">Aucun participant trouvé</div>
                ) : (
                  <div className="table-container">
                    <table className="participants-table">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Prénom</th>
                          <th>Email</th>
                          <th>Téléphone</th>
                          <th>Genre</th>
                          <th>Date de naissance</th>
                          <th>Date participation</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map(p => (
                          <tr key={p.id}>
                            <td>{p.nom}</td>
                            <td>{p.prenom}</td>
                            <td>{p.email}</td>
                            <td>{p.telephone}</td>
                            <td>{p.genre === 'M' ? 'Homme' : 'Femme'}</td>
                            <td>{new Date(p.date_naissance).toLocaleDateString()}</td>
                            <td>{new Date(p.date_participation).toLocaleDateString()}</td>
                            <td>
                              <button
                                className="delete-button"
                                onClick={() => handleDeleteParticipant(p.id)}
                                disabled={deletingParticipant === p.id}
                              >
                                {deletingParticipant === p.id ? 'Suppression...' : 'Supprimer'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Admin; 