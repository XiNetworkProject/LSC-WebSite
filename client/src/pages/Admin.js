import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUserShield, faChartBar, faGift, faUsers, faVenusMars, faBirthdayCake, faSync, faPlus, faTrash, faEdit, faCalendar, faRandom, faTrophy } from '@fortawesome/free-solid-svg-icons';
import config from '../config';
import './Admin.css';

function Admin() {
  const [password, setPassword] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [error, setError] = useState('');
  const [sessionPassword, setSessionPassword] = useState('');
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
  const [showNewJeuForm, setShowNewJeuForm] = useState(false);
  const [deletingJeuId, setDeletingJeuId] = useState(null);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [drawingWinner, setDrawingWinner] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [selectedJeuForDraw, setSelectedJeuForDraw] = useState(null);

  // Ajout de nouveaux états pour le tableau de bord
  const [dashboardStats, setDashboardStats] = useState({
    totalParticipants: 0,
    hommes: 0,
    femmes: 0,
    ageMoyen: 0,
    participantsParJeu: {},
    participationParJour: {},
    jeuxActifs: 0,
    participantsAujourdhui: 0
  });

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
          setSessionPassword(password);
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
    const currentPassword = pwd || sessionPassword;
    setLoadingJeux(true);
    fetch(`${config.apiUrl}/api/admin/jeux/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword })
    })
      .then(res => res.json())
      .then(data => {
        setJeux(Array.isArray(data) ? data : []);
        setLoadingJeux(false);
        refreshStats(currentPassword);
      })
      .catch(() => setLoadingJeux(false));
  };

  // Ajouter un jeu concours
  const handleAddJeu = (e) => {
    e.preventDefault();
    console.log('Tentative d\'ajout d\'un jeu');
    console.log('Formulaire:', addForm);
    console.log('Mot de passe de session:', sessionPassword);
    
    setAddError('');
    setAddSuccess('');
    if (!addForm.titre) {
      console.log('Erreur: titre manquant');
      setAddError('Le titre est obligatoire');
      return;
    }
    
    console.log('Envoi de la requête à:', `${config.apiUrl}/api/admin/jeux`);
    fetch(`${config.apiUrl}/api/admin/jeux`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, password: sessionPassword })
    })
      .then(res => {
        console.log('Réponse reçue:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Données reçues:', data);
        if (data.success) {
          setAddSuccess('Jeu ajouté !');
          setAddForm({ titre: '', description: '', date_debut: '', date_fin: '', banniere: '', lots: [{ rang: 1, description: '', valeur: '' }], age_minimum: 18 });
          fetchJeux(sessionPassword);
        } else {
          setAddError(data.error || 'Erreur lors de l\'ajout');
        }
      })
      .catch(err => {
        console.error('Erreur lors de l\'ajout:', err);
        setAddError('Erreur lors de l\'ajout');
      });
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
        password: sessionPassword,
        searchTerm: searchTerm.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        setParticipants(Array.isArray(data) ? data : []);
        setParticipantsLoading(false);
        refreshStats(sessionPassword);
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
      body: JSON.stringify({ participant_id, password: sessionPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchParticipants(showParticipantsJeuId);
          refreshStats(sessionPassword);
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
  const handleDeleteJeu = (jeu_id) => {
    if (!window.confirm('Supprimer ce jeu concours ?')) return;
    setDeletingJeuId(jeu_id);
    
    fetch(`${config.apiUrl}/api/admin/jeux/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jeu_id, password: sessionPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchJeux();
          refreshStats(sessionPassword);
        }
        setDeletingJeuId(null);
      })
      .catch(() => setDeletingJeuId(null));
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
      body: JSON.stringify({ ...editForm, password: sessionPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEditSuccess('Jeu modifié !');
          setEditJeu(null);
          fetchJeux(sessionPassword);
        } else {
          setEditError(data.error || 'Erreur lors de la modification');
        }
      })
      .catch(() => setEditError('Erreur lors de la modification'));
  };

  const handleLogout = () => {
    setIsLogged(false);
    setSessionPassword('');
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

  const refreshStats = (pwd) => {
    const currentPassword = pwd || sessionPassword;
    fetch(`${config.apiUrl}/api/admin/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatsError(data.error);
          setDashboardStats({
            totalParticipants: 0,
            hommes: 0,
            femmes: 0,
            ageMoyen: 0,
            participantsParJeu: {},
            participationParJour: {},
            jeuxActifs: 0,
            participantsAujourdhui: 0
          });
        } else {
          setStatsError('');
          // Calcul des jeux actifs
          const jeuxActifs = jeux.filter(jeu => {
            const now = new Date();
            const debut = new Date(jeu.date_debut);
            const fin = new Date(jeu.date_fin);
            return debut <= now && now <= fin;
          }).length;

          // Calcul des participants aujourd'hui
          const aujourdhui = new Date().toLocaleDateString();
          const participantsAujourdhui = Object.entries(data.participationParJour)
            .find(([date]) => date === aujourdhui)?.[1] || 0;

          setDashboardStats({
            ...data,
            jeuxActifs,
            participantsAujourdhui
          });
        }
      })
      .catch(e => {
        setStatsError('Erreur lors de la récupération des stats');
        console.error('Erreur stats:', e);
      });
  };

  // Fonction pour effectuer un tirage au sort
  const handleDrawWinner = (jeuId) => {
    setDrawingWinner(true);
    setSelectedJeuForDraw(jeuId);
    setShowDrawModal(true);
    
    // Récupérer tous les participants du jeu
    fetch(`${config.apiUrl}/api/admin/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        jeu_id: jeuId, 
        password: sessionPassword,
        searchTerm: ''
      })
    })
      .then(res => res.json())
      .then(participants => {
        if (participants.length === 0) {
          setDrawingWinner(false);
          alert('Aucun participant pour ce jeu');
          return;
        }
        
        // Animation de tirage au sort
        let count = 0;
        const maxCount = 20;
        const interval = setInterval(() => {
          const randomIndex = Math.floor(Math.random() * participants.length);
          setSelectedWinner(participants[randomIndex]);
          count++;
          
          if (count >= maxCount) {
            clearInterval(interval);
            setDrawingWinner(false);
            // Sauvegarder le gagnant
            fetch(`${config.apiUrl}/api/admin/winner`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                jeu_id: jeuId,
                participant_id: participants[randomIndex].id,
                password: sessionPassword
              })
            })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                console.log('Gagnant enregistré');
              }
            })
            .catch(err => console.error('Erreur lors de l\'enregistrement du gagnant:', err));
          }
        }, 100);
      })
      .catch(err => {
        console.error('Erreur lors du tirage au sort:', err);
        setDrawingWinner(false);
      });
  };

  useEffect(() => {
    if (isLogged && sessionPassword) {
      fetchJeux(sessionPassword);
    }
  }, [isLogged, sessionPassword]);

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
            <FontAwesomeIcon icon={faChartBar} />
            Tableau de bord
          </button>

          <button
            className={`nav-item ${activeSection === 'jeux' ? 'active' : ''}`}
            onClick={() => setActiveSection('jeux')}
          >
            <FontAwesomeIcon icon={faGift} />
            Jeux concours
          </button>

          {showParticipantsJeuId && (
            <button
              className={`nav-item ${activeSection === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveSection('participants')}
            >
              <FontAwesomeIcon icon={faUsers} />
              Participants
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faLock} />
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
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez le mot de passe admin"
                  />
                </div>
                <button
                  type="submit"
                  className="login-button"
                  disabled={loadingJeux}
                >
                  {loadingJeux ? 'Connexion...' : 'Se connecter'}
                </button>
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
              </form>
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
              <button className="refresh-button" onClick={() => refreshStats(sessionPassword)}>
                <FontAwesomeIcon icon={faSync} />
                Actualiser
              </button>
            </header>

            {activeSection === 'dashboard' && (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Total Participants</h3>
                    <div className="stat-value">{dashboardStats.totalParticipants}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Jeux Actifs</h3>
                    <div className="stat-value">{dashboardStats.jeuxActifs}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Participants Aujourd'hui</h3>
                    <div className="stat-value">{dashboardStats.participantsAujourdhui}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Répartition Genre</h3>
                    <div className="stat-value">
                      <div className="gender-stats">
                        <span className="gender-male">
                          <FontAwesomeIcon icon={faVenusMars} /> {dashboardStats.hommes} H
                        </span>
                        <span className="gender-female">
                          <FontAwesomeIcon icon={faVenusMars} /> {dashboardStats.femmes} F
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <h3>Âge Moyen</h3>
                    <div className="stat-value">
                      <FontAwesomeIcon icon={faBirthdayCake} /> {Math.round(dashboardStats.ageMoyen)} ans
                    </div>
                  </div>
                </div>

                <div className="content-card">
                  <h3>Participation par Jour</h3>
                  <div className="participation-chart">
                    {Object.entries(dashboardStats.participationParJour)
                      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                      .slice(0, 7)
                      .map(([date, count]) => (
                        <div key={date} className="participation-bar">
                          <div className="bar-label">{new Date(date).toLocaleDateString()}</div>
                          <div className="bar-value">{count}</div>
                          <div 
                            className="bar-fill" 
                            style={{ 
                              height: `${(count / Math.max(...Object.values(dashboardStats.participationParJour))) * 100}%` 
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {activeSection === 'jeux' && (
              <div className="content-card">
                <div className="card-header">
                  <button className="add-button" onClick={() => setShowNewJeuForm(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                    Nouveau jeu concours
                  </button>
                </div>

                {showNewJeuForm && (
                  <div className="form-container">
                    <h3>Nouveau jeu concours</h3>
                    <form onSubmit={handleAddJeu}>
                      <div className="form-group">
                        <label>Titre</label>
                        <input
                          type="text"
                          value={addForm.titre}
                          onChange={(e) => setAddForm({ ...addForm, titre: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={addForm.description}
                          onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Date de début</label>
                          <input
                            type="date"
                            value={addForm.date_debut}
                            onChange={(e) => setAddForm({ ...addForm, date_debut: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Date de fin</label>
                          <input
                            type="date"
                            value={addForm.date_fin}
                            onChange={(e) => setAddForm({ ...addForm, date_fin: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>URL de la bannière</label>
                        <input
                          type="text"
                          value={addForm.banniere}
                          onChange={(e) => setAddForm({ ...addForm, banniere: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Âge minimum</label>
                        <input
                          type="number"
                          value={addForm.age_minimum}
                          onChange={(e) => setAddForm({ ...addForm, age_minimum: parseInt(e.target.value) || 18 })}
                          min="18"
                        />
                      </div>
                      <div className="form-group">
                        <label>Lots</label>
                        {addForm.lots.map((lot, index) => (
                          <div key={index} className="lot-input">
                            <input
                              type="number"
                              value={lot.rang}
                              onChange={(e) => handleLotChange(index, 'rang', parseInt(e.target.value) || 1)}
                              placeholder="Rang"
                              min="1"
                            />
                            <input
                              type="text"
                              value={lot.description}
                              onChange={(e) => handleLotChange(index, 'description', e.target.value)}
                              placeholder="Description"
                            />
                            <input
                              type="text"
                              value={lot.valeur}
                              onChange={(e) => handleLotChange(index, 'valeur', e.target.value)}
                              placeholder="Valeur"
                            />
                            <button
                              type="button"
                              className="remove-lot-button"
                              onClick={() => handleRemoveLot(index)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="add-lot-button"
                          onClick={handleAddLot}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                          Ajouter un lot
                        </button>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="submit-button">
                          Ajouter le jeu
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => setShowNewJeuForm(false)}
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

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
                            <FontAwesomeIcon icon={faCalendar} />
                            Du {new Date(jeu.date_debut).toLocaleDateString()} au {new Date(jeu.date_fin).toLocaleDateString()}
                          </div>
                          <div>
                            <FontAwesomeIcon icon={faUsers} />
                            {dashboardStats.participantsParJeu[jeu.id] || 0} participants
                          </div>
                          <div>
                            <FontAwesomeIcon icon={faBirthdayCake} />
                            Âge minimum : {jeu.age_minimum} ans
                          </div>
                          {jeu.description && (
                            <div className="jeu-description">
                              {jeu.description}
                            </div>
                          )}
                          {jeu.lots && jeu.lots.length > 0 && (
                            <div className="jeu-lots">
                              <h4>Lots</h4>
                              <ul>
                                {jeu.lots.map((lot, index) => (
                                  <li key={index}>
                                    {lot.rang}. {lot.description} - {lot.valeur}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="jeu-actions">
                          <button
                            className="view-button"
                            onClick={() => {
                              setActiveSection('participants');
                              handleShowParticipants(jeu.id);
                            }}
                          >
                            <FontAwesomeIcon icon={faUsers} />
                            Participants
                          </button>
                          <button
                            className="edit-button"
                            onClick={() => {
                              setActiveSection('jeux');
                              handleEditJeu(jeu);
                            }}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            Modifier
                          </button>
                          <button
                            className="draw-button"
                            onClick={() => handleDrawWinner(jeu.id)}
                            disabled={drawingWinner}
                          >
                            <FontAwesomeIcon icon={faRandom} />
                            Tirage au sort
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteJeu(jeu.id)}
                            disabled={deletingJeuId === jeu.id}
                          >
                            <FontAwesomeIcon icon={faTrash} />
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
                    className="search-input"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Rechercher un participant..."
                  />
                </div>

                {participantsLoading ? (
                  <div className="loading-message">Chargement des participants...</div>
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
                            <td>
                              <span className={`gender-badge ${p.genre === 'M' ? 'male' : 'female'}`}>
                                {p.genre === 'M' ? 'Homme' : 'Femme'}
                              </span>
                            </td>
                            <td>{new Date(p.date_naissance).toLocaleDateString()}</td>
                            <td>{new Date(p.date_participation).toLocaleDateString()}</td>
                            <td>
                              <button
                                className="delete-button"
                                onClick={() => handleDeleteParticipant(p.id)}
                                disabled={deletingParticipant === p.id}
                              >
                                <FontAwesomeIcon icon={faTrash} />
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

            {/* Modal de tirage au sort */}
            {showDrawModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2>Tirage au sort</h2>
                  {drawingWinner ? (
                    <div className="drawing-animation">
                      <div className="spinner"></div>
                      <p>Tirage en cours...</p>
                    </div>
                  ) : selectedWinner ? (
                    <div className="winner-announcement">
                      <FontAwesomeIcon icon={faTrophy} className="trophy-icon" />
                      <h3>Le gagnant est :</h3>
                      <p className="winner-name">{selectedWinner.prenom} {selectedWinner.nom}</p>
                      <p className="winner-email">{selectedWinner.email}</p>
                      <button 
                        className="close-button"
                        onClick={() => {
                          setShowDrawModal(false);
                          setSelectedWinner(null);
                          setSelectedJeuForDraw(null);
                        }}
                      >
                        Fermer
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Admin; 