import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

function JeuxConcours() {
  const [jeux, setJeux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formJeuId, setFormJeuId] = useState(null);
  const [formData, setFormData] = useState({ 
    nom: '', 
    prenom: '', 
    email: '', 
    telephone: '',
    genre: '',
    date_naissance: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [ageValid, setAgeValid] = useState(false);
  const [antiBot, setAntiBot] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/jeux')
      .then(res => res.json())
      .then(data => {
        setJeux(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur lors du chargement des jeux concours');
        setLoading(false);
      });
  }, []);

  const checkAge = (date_naissance) => {
    if (!date_naissance) return false;
    const birth = new Date(date_naissance);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age >= 18;
  };

  useEffect(() => {
    setAgeValid(checkAge(formData.date_naissance));
  }, [formData.date_naissance]);

  const handleShowForm = (jeuId) => {
    setFormJeuId(jeuId);
    setFormData({ nom: '', prenom: '', email: '', telephone: '', genre: '', date_naissance: '' });
    setFormError('');
    setFormSuccess('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!formData.nom || !formData.prenom || !formData.email || !formData.date_naissance) {
      setFormError('Merci de remplir tous les champs obligatoires.');
      showToast('Merci de remplir tous les champs obligatoires.', true);
      return;
    }
    if (!ageValid) {
      setFormError('Vous devez avoir au moins 18 ans pour participer.');
      showToast('Vous devez avoir au moins 18 ans pour participer.', true);
      return;
    }
    if (!acceptCGU) {
      setFormError('Vous devez accepter les CGU et le règlement du jeu.');
      showToast('Vous devez accepter les CGU et le règlement du jeu.', true);
      return;
    }
    if (antiBot.trim() !== '7') {
      setFormError('Merci de répondre correctement à la question anti-robot.');
      showToast('Merci de répondre correctement à la question anti-robot.', true);
      return;
    }
    if (!formData.genre) {
      setFormError('Merci de sélectionner votre genre.');
      showToast('Merci de sélectionner votre genre.', true);
      return;
    }
    setSending(true);
    fetch('http://localhost:5000/api/participer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, jeu_id: formJeuId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFormSuccess('Participation enregistrée ! Bonne chance !');
          setFormData({ nom: '', prenom: '', email: '', telephone: '', genre: '', date_naissance: '' });
          showToast('Participation enregistrée ! Bonne chance !');
        } else {
          setFormError(data.error || 'Erreur lors de la participation.');
          showToast(data.error || 'Erreur lors de la participation.', true);
        }
        setSending(false);
      })
      .catch(() => {
        setFormError('Erreur lors de la participation.');
        showToast('Erreur lors de la participation.', true);
        setSending(false);
      });
  };

  return (
    <div className="jeux-concours">
      <h2><FontAwesomeIcon icon={faTrophy} style={{color:'#ff9e3d',marginRight:10}} />Jeux concours</h2>
      {loading && <div className="loader"></div>}
      {error && <p style={{color:'red'}}>{error}</p>}
      {toast && (
        <div className="toast" style={{background: toast.isError ? '#b22222' : undefined}}>{toast.msg}</div>
      )}
      {!loading && !error && (
        jeux.length === 0 ? (
          <p>Aucun jeu concours en cours pour le moment.</p>
        ) : (
          <div style={{
            display:'flex',
            flexDirection:'column',
            gap:'2rem',
            maxWidth:600,
            margin:'0 auto',
            padding:'0 1rem'
          }}>
            {jeux.map(jeu => {
              const dateDebut = jeu.date_debut ? new Date(jeu.date_debut).toLocaleDateString() : 'N/A';
              const dateFin = jeu.date_fin ? new Date(jeu.date_fin).toLocaleDateString() : 'N/A';
              return (
                <div key={jeu.id} style={{
                  width:'100%',
                  minHeight:280,
                  background:'#fff',
                  borderRadius:22,
                  boxShadow:'0 6px 32px rgba(0,0,0,0.10)',
                  overflow:'hidden',
                  position:'relative',
                  display:'flex',
                  flexDirection:'column',
                  justifyContent:'flex-end',
                  transition:'transform 0.18s',
                }}>
                  {jeu.banniere && (
                    <div style={{
                      position:'absolute',
                      top:0,left:0,right:0,bottom:0,
                      zIndex:1,
                      background:`url(${jeu.banniere}) center/cover no-repeat`,
                      filter:'brightness(0.65) blur(0px)',
                    }}></div>
                  )}
                  <div style={{
                    position:'relative',
                    zIndex:2,
                    padding:'2.2rem 1.2rem 1.2rem 1.2rem',
                    display:'flex',
                    flexDirection:'column',
                    alignItems:'center'
                  }}>
                    <div style={{
                      background:'rgba(255,255,255,0.92)',
                      borderRadius:12,
                      padding:'0.5rem 1.2rem',
                      marginBottom:10,
                      fontWeight:700,
                      color:'#ff9e3d',
                      fontSize:'1.1rem',
                      boxShadow:'0 1px 6px rgba(0,0,0,0.06)'
                    }}>
                      {dateDebut === dateFin ? (
                        <>Le {dateDebut}</>
                      ) : (
                        <>Du {dateDebut} au {dateFin}</>
                      )}
                    </div>
                    <h3 style={{
                      color:'#232323',
                      background:'rgba(255,255,255,0.92)',
                      borderRadius:10,
                      padding:'0.5rem 1rem',
                      margin:'0 0 0.7rem 0',
                      fontWeight:800,
                      fontSize:'1.3rem',
                      boxShadow:'0 1px 6px rgba(0,0,0,0.06)'
                    }}>{jeu.titre}</h3>
                    <div style={{
                      color:'#444',
                      background:'rgba(255,255,255,0.85)',
                      borderRadius:8,
                      padding:'0.5rem 0.8rem',
                      marginBottom:10,
                      fontSize:'1rem',
                      boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
                      width:'100%',
                      maxWidth:500,
                      textAlign:'center'
                    }}>{jeu.description}</div>
                    <button 
                      style={{
                        marginTop:8,
                        marginBottom:jeu.id===formJeuId?12:0,
                        zIndex:3,
                        minWidth:200
                      }} 
                      onClick={() => handleShowForm(jeu.id)} 
                      className="jeu-carte-btn"
                    >
                      <FontAwesomeIcon icon={faPaperPlane} style={{marginRight:8}} />Participer
                    </button>
                    {formJeuId === jeu.id && (
                      <form onSubmit={handleSubmit} style={{
                        marginTop:20,
                        textAlign:'left',
                        width:'100%',
                        maxWidth:500,
                        marginLeft:'auto',
                        marginRight:'auto',
                        background:'rgba(255,255,255,0.98)',
                        borderRadius:12,
                        padding:'1.5rem',
                        boxShadow:'0 2px 8px rgba(0,0,0,0.07)'
                      }}>
                        <div style={{marginBottom:10}}>
                          <label>Nom*<br/>
                            <input type="text" name="nom" value={formData.nom} onChange={handleChange} style={{width:'100%',padding:8}} required />
                          </label>
                        </div>
                        <div style={{marginBottom:10}}>
                          <label>Prénom*<br/>
                            <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} style={{width:'100%',padding:8}} required />
                          </label>
                        </div>
                        <div style={{marginBottom:10}}>
                          <label>Email*<br/>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} style={{width:'100%',padding:8}} required />
                          </label>
                        </div>
                        <div style={{marginBottom:10}}>
                          <label>Téléphone<br/>
                            <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} style={{width:'100%',padding:8}} />
                          </label>
                        </div>
                        <div style={{marginBottom:10}}>
                          <label>Genre*<br/>
                            <select name="genre" value={formData.genre} onChange={handleChange} style={{width:'100%',padding:8}} required>
                              <option value="">Sélectionner...</option>
                              <option value="M">Homme</option>
                              <option value="F">Femme</option>
                            </select>
                          </label>
                        </div>
                        <div style={{marginBottom:10}}>
                          <label>Date de naissance*<br/>
                            <input 
                              type="date" 
                              name="date_naissance" 
                              value={formData.date_naissance} 
                              onChange={handleChange} 
                              style={{width:'100%',padding:8}} 
                              required 
                            />
                          </label>
                          {!ageValid && formData.date_naissance && (
                            <div style={{color:'red',fontSize:'0.95em'}}>Vous devez avoir au moins 18 ans pour participer.</div>
                          )}
                        </div>
                        <div style={{marginBottom:10}}>
                          <label style={{display:'flex',alignItems:'center'}}>
                            <input type="checkbox" checked={acceptCGU} onChange={e => setAcceptCGU(e.target.checked)} style={{marginRight:8}} required />
                            J'accepte les <Link to="/cgu" target="_blank" style={{color:'#2e8b57',textDecoration:'underline'}}>CGU</Link> et le <Link to="/reglement-jeu" target="_blank" style={{color:'#2e8b57',textDecoration:'underline'}}>règlement du jeu</Link>
                          </label>
                        </div>
                        <div style={{marginBottom:10}}>
                          <label>Question anti-robot*<br/>
                            <input type="text" value={antiBot} onChange={e => setAntiBot(e.target.value)} style={{width:'100%',padding:8}} placeholder="Combien font 3 + 4 ?" required />
                          </label>
                        </div>
                        {formError && <div style={{color:'red', marginBottom:10}}>{formError}</div>}
                        {formSuccess && <div style={{color:'green', marginBottom:10}}>{formSuccess}</div>}
                        <button type="submit" disabled={sending || !ageValid || !acceptCGU || antiBot.trim() !== '7'} style={{width:'100%',padding:10,background:'#ff9e3d',color:'#fff',border:'none',borderRadius:5,fontWeight:600,opacity:(!ageValid||!acceptCGU||antiBot.trim()!=='7')?0.7:1}}>
                          {sending ? 'Envoi...' : 'Valider ma participation'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

export default JeuxConcours; 