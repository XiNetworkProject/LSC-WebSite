import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUserShield, faChartBar, faGift, faUsers, faVenusMars, faBirthdayCake } from '@fortawesome/free-solid-svg-icons';

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

  // Connexion admin
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    fetch('http://localhost:5000/api/admin/login', {
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
    fetch('http://localhost:5000/api/admin/jeux/list', {
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
    fetch('http://localhost:5000/api/admin/jeux', {
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
    fetch('http://localhost:5000/api/admin/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jeu_id, password: adminPassword })
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

  // Supprimer un jeu concours
  const handleDeleteJeu = (id) => {
    if (!window.confirm('Supprimer ce jeu ?')) return;
    fetch('http://localhost:5000/api/admin/jeux/delete', {
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
    fetch('http://localhost:5000/api/admin/jeux/edit', {
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
    fetch('http://localhost:5000/api/admin/stats', {
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
      fetch('http://localhost:5000/api/admin/stats', {
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
    <div className="admin">
      <h2><FontAwesomeIcon icon={faLock} style={{color:'#ff9e3d',marginRight:10}} />Espace administrateur</h2>
      {!isLogged ? (
        <form onSubmit={handleSubmit} style={{maxWidth:350,margin:'2rem auto',textAlign:'left'}}>
          <label>Mot de passe<br/>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{width:'100%',padding:8,marginTop:5}}
              required
            />
          </label>
          {error && <div style={{color:'red',marginTop:10}}>{error}</div>}
          <button type="submit" className="admin-login-btn">
            <FontAwesomeIcon icon={faUserShield} style={{marginRight:8}} />Connexion
          </button>
        </form>
      ) : (
        <div style={{textAlign:'center'}}>
          <button onClick={handleLogout} style={{marginBottom:20,background:'#eee',color:'#2e8b57',border:'none',padding:'8px 20px',borderRadius:5,fontWeight:600,float:'right'}}>
            Déconnexion
          </button>

          {/* Statistiques */}
          <div style={{marginBottom:40,background:'#fff',padding:20,borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
            <h3><FontAwesomeIcon icon={faChartBar} style={{color:'#ff9e3d',marginRight:8}} />Statistiques</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:20,marginTop:20}}>
              <div style={{background:'#f8f9fa',padding:15,borderRadius:8}}>
                <FontAwesomeIcon icon={faUsers} style={{color:'#2e8b57',fontSize:24,marginBottom:8}} />
                <div style={{fontSize:24,fontWeight:700}}>{stats.totalParticipants}</div>
                <div style={{color:'#666'}}>Participants total</div>
              </div>
              <div style={{background:'#f8f9fa',padding:15,borderRadius:8}}>
                <FontAwesomeIcon icon={faVenusMars} style={{color:'#2e8b57',fontSize:24,marginBottom:8}} />
                <div style={{fontSize:24,fontWeight:700}}>{stats.hommes}H / {stats.femmes}F</div>
                <div style={{color:'#666'}}>Répartition</div>
              </div>
              <div style={{background:'#f8f9fa',padding:15,borderRadius:8}}>
                <FontAwesomeIcon icon={faBirthdayCake} style={{color:'#2e8b57',fontSize:24,marginBottom:8}} />
                <div style={{fontSize:24,fontWeight:700}}>
                  {stats.ageMoyen !== null && !isNaN(stats.ageMoyen) ? Math.round(stats.ageMoyen) + ' ans' : 'N/A'}
                </div>
                <div style={{color:'#666'}}>Âge moyen</div>
              </div>
            </div>
            {statsError && <div style={{color:'red',marginBottom:10}}>{statsError}</div>}
          </div>

          <h3>Ajouter un jeu concours</h3>
          <form onSubmit={handleAddJeu} style={{maxWidth:600,margin:'1rem auto',textAlign:'left'}}>
            <div style={{marginBottom:10}}>
              <label>Titre*<br/>
                <input type="text" name="titre" value={addForm.titre} onChange={e => setAddForm({...addForm, titre: e.target.value})} style={{width:'100%',padding:8}} required />
              </label>
            </div>
            <div style={{marginBottom:10}}>
              <label>Description<br/>
                <textarea name="description" value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})} style={{width:'100%',padding:8}} />
              </label>
            </div>
            <div style={{marginBottom:10,display:'flex',gap:10}}>
              <label style={{flex:1}}>Date début<br/>
                <input type="date" name="date_debut" value={addForm.date_debut} onChange={e => setAddForm({...addForm, date_debut: e.target.value})} style={{width:'100%',padding:8}} />
              </label>
              <label style={{flex:1}}>Date fin<br/>
                <input type="date" name="date_fin" value={addForm.date_fin} onChange={e => setAddForm({...addForm, date_fin: e.target.value})} style={{width:'100%',padding:8}} />
              </label>
            </div>
            <div style={{marginBottom:10}}>
              <label>Bannière (URL)<br/>
                <input type="text" name="banniere" value={addForm.banniere} onChange={e => setAddForm({...addForm, banniere: e.target.value})} style={{width:'100%',padding:8}} />
              </label>
            </div>
            <div style={{marginBottom:20}}>
              <label>Âge minimum*<br/>
                <input 
                  type="number" 
                  name="age_minimum" 
                  value={addForm.age_minimum} 
                  onChange={e => setAddForm({...addForm, age_minimum: parseInt(e.target.value)})} 
                  style={{width:'100%',padding:8}} 
                  min="18"
                  required 
                />
              </label>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                <FontAwesomeIcon icon={faGift} style={{color:'#ff9e3d'}} />
                Lots à gagner
              </label>
              {addForm.lots.map((lot, index) => (
                <div key={index} style={{display:'flex',gap:10,marginBottom:10}}>
                  <input
                    type="number"
                    value={lot.rang}
                    onChange={e => handleLotChange(index, 'rang', parseInt(e.target.value))}
                    style={{width:80,padding:8}}
                    placeholder="Rang"
                    min="1"
                  />
                  <input
                    type="text"
                    value={lot.description}
                    onChange={e => handleLotChange(index, 'description', e.target.value)}
                    style={{flex:1,padding:8}}
                    placeholder="Description du lot"
                  />
                  <input
                    type="text"
                    value={lot.valeur}
                    onChange={e => handleLotChange(index, 'valeur', e.target.value)}
                    style={{width:120,padding:8}}
                    placeholder="Valeur"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLot(index)}
                      style={{background:'#ffdddd',color:'#b22222',border:'none',padding:'8px 12px',borderRadius:5}}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddLot}
                style={{background:'#eee',color:'#2e8b57',border:'none',padding:'8px 16px',borderRadius:5,marginTop:10}}
              >
                + Ajouter un lot
              </button>
            </div>
            {addError && <div style={{color:'red',marginBottom:10}}>{addError}</div>}
            {addSuccess && <div style={{color:'green',marginBottom:10}}>{addSuccess}</div>}
            <button type="submit" style={{width:'100%',padding:10,background:'#2e8b57',color:'#fff',border:'none',borderRadius:5,fontWeight:600}}>
              Ajouter le jeu
            </button>
          </form>

          <h3 style={{marginTop:40}}>Liste des jeux concours</h3>
          {loadingJeux ? <p>Chargement...</p> : (
            <ul style={{padding:0}}>
              {jeux.map(jeu => (
                <li key={jeu.id} style={{marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', listStyle:'none'}}>
                  {editJeu === jeu.id ? (
                    <form onSubmit={handleEditSubmit} style={{marginBottom:20, textAlign:'left', maxWidth:400, marginLeft:'auto', marginRight:'auto'}}>
                      <div style={{marginBottom:10}}>
                        <label>Titre*<br/>
                          <input type="text" name="titre" value={editForm.titre} onChange={e => setEditForm({...editForm, titre: e.target.value})} style={{width:'100%',padding:8}} required />
                        </label>
                      </div>
                      <div style={{marginBottom:10}}>
                        <label>Description<br/>
                          <textarea name="description" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{width:'100%',padding:8}} />
                        </label>
                      </div>
                      <div style={{marginBottom:10,display:'flex',gap:10}}>
                        <label style={{flex:1}}>Date début<br/>
                          <input type="date" name="date_debut" value={editForm.date_debut} onChange={e => setEditForm({...editForm, date_debut: e.target.value})} style={{width:'100%',padding:8}} />
                        </label>
                        <label style={{flex:1}}>Date fin<br/>
                          <input type="date" name="date_fin" value={editForm.date_fin} onChange={e => setEditForm({...editForm, date_fin: e.target.value})} style={{width:'100%',padding:8}} />
                        </label>
                      </div>
                      <div style={{marginBottom:10}}>
                        <label>Bannière (URL)<br/>
                          <input type="text" name="banniere" value={editForm.banniere} onChange={e => setEditForm({...editForm, banniere: e.target.value})} style={{width:'100%',padding:8}} />
                        </label>
                      </div>
                      {editError && <div style={{color:'red',marginBottom:10}}>{editError}</div>}
                      {editSuccess && <div style={{color:'green',marginBottom:10}}>{editSuccess}</div>}
                      <button type="submit" style={{width:'100%',padding:10,background:'#2e8b57',color:'#fff',border:'none',borderRadius:5,fontWeight:600}}>
                        Enregistrer
                      </button>
                      <button type="button" onClick={() => setEditJeu(null)} style={{width:'100%',padding:10,background:'#eee',color:'#2e8b57',border:'none',borderRadius:5,fontWeight:600,marginTop:8}}>
                        Annuler
                      </button>
                    </form>
                  ) : (
                    <>
                      <h4>{jeu.titre}</h4>
                      {jeu.banniere && <img src={jeu.banniere} alt="bannière" style={{maxWidth:'100%',maxHeight:120,objectFit:'cover',marginBottom:10}} />}
                      <p>{jeu.description}</p>
                      <p><b>Du</b> {jeu.date_debut ? new Date(jeu.date_debut).toLocaleDateString() : 'N/A'} <b>au</b> {jeu.date_fin ? new Date(jeu.date_fin).toLocaleDateString() : 'N/A'}</p>
                      <p><b>Âge minimum :</b> {jeu.age_minimum || 18} ans</p>
                      
                      {jeu.lots && jeu.lots.length > 0 && (
                        <div style={{marginTop:10}}>
                          <h5>Lots à gagner :</h5>
                          <ul style={{listStyle:'none',padding:0}}>
                            {jeu.lots.map((lot, index) => (
                              <li key={index} style={{marginBottom:5}}>
                                <b>{lot.rang}.</b> {lot.description} - {lot.valeur}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div style={{marginTop:15}}>
                        <button onClick={() => handleEditJeu(jeu)} style={{marginRight:10,background:'#eee',color:'#2e8b57',border:'none',padding:'6px 16px',borderRadius:5,fontWeight:600}}>
                          Modifier
                        </button>
                        <button onClick={() => handleDeleteJeu(jeu.id)} style={{marginRight:10,background:'#ffdddd',color:'#b22222',border:'none',padding:'6px 16px',borderRadius:5,fontWeight:600}}>
                          Supprimer
                        </button>
                        <button onClick={() => handleShowParticipants(jeu.id)} style={{marginTop:10,background:'#2e8b57',color:'#fff',border:'none',padding:'6px 16px',borderRadius:5,fontWeight:600}}>
                          Voir les participants
                        </button>
                      </div>
                    </>
                  )}
                  {showParticipantsJeuId === jeu.id && (
                    <div style={{marginTop:15}}>
                      <h5>Participants</h5>
                      {participantsLoading ? <p>Chargement...</p> : (
                        participants.length === 0 ? <p>Aucun participant</p> : (
                          <ul style={{padding:0}}>
                            {participants.map(p => (
                              <li key={p.id} style={{marginBottom:8,listStyle:'none',borderBottom:'1px solid #eee',paddingBottom:4}}>
                                {p.prenom} {p.nom} - {p.email} {p.telephone && (<span>({p.telephone})</span>)}
                                <br/>
                                <span style={{fontSize:'0.9em',color:'#888'}}>
                                  {p.genre && <span>{p.genre === 'M' ? 'Homme' : 'Femme'} - </span>}
                                  {p.date_naissance && <span>{new Date().getFullYear() - new Date(p.date_naissance).getFullYear()} ans - </span>}
                                  le {new Date(p.date_participation).toLocaleString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin; 