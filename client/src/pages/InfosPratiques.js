import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faBus, faSubway, faCar, faBicycle } from '@fortawesome/free-solid-svg-icons';

function isOpenNow(date = new Date()) {
  const day = date.getDay();
  const hour = date.getHours();
  const min = date.getMinutes();
  if (day >= 1 && day <= 5) {
    if ((hour > 7 && hour < 19) || (hour === 7 && min >= 0) || (hour === 19 && min <= 30)) return true;
    return false;
  }
  if (day === 6) {
    if ((hour > 8 && hour < 19) || (hour === 8 && min >= 0) || (hour === 19 && min <= 30)) return true;
    return false;
  }
  if (day === 0) {
    if ((hour > 8 && hour < 12) || (hour === 8 && min >= 30) || (hour === 12 && min <= 30)) return true;
    return false;
  }
  return false;
}

function InfosPratiques() {
  const ouvert = isOpenNow();
  return (
    <div className="infos-pratiques">
      <h2><FontAwesomeIcon icon={faMapMarkerAlt} style={{color:'#ff9e3d',marginRight:10}} />Infos pratiques</h2>
      <div style={{marginBottom:16}}>
        <span style={{fontWeight:700, color: ouvert ? '#2e8b57' : '#b22222', background: ouvert ? '#e6f7ed' : '#ffeaea', borderRadius:8, padding:'4px 12px', fontSize:'1rem', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          {ouvert ? 'Actuellement ouvert' : 'Actuellement fermé'}
        </span>
      </div>
      <ul>
        <li><b>Adresse :</b> 176 Rue Clemenceau, 59139 Wattignies</li>
        <li><b>Horaires :</b></li>
        <ul style={{marginBottom:10}}>
          <li>Lundi au vendredi : 7h00 - 19h30</li>
          <li>Samedi : 8h00 - 19h30</li>
          <li>Dimanche : 8h30 - 12h30</li>
        </ul>
        <li><b>Téléphone :</b> 03 20 95 00 02</li>
        <li><b>Email :</b> NON DISPONIBLE</li>
      </ul>
      <div style={{margin:'2rem 0', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.08)'}}>
        <iframe
          title="Google Maps - Saint Claude"
          src="https://www.google.com/maps?q=176+rue+Clemenceau,+59139+Wattignies&output=embed"
          width="100%"
          height="300"
          style={{border:0}}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <div className="comment-sy-rendre">
        <h3>Comment s'y rendre ?</h3>
        <ul style={{listStyle:'none',padding:0}}>
          <li><FontAwesomeIcon icon={faBus} style={{color:'#2e7d32',marginRight:8}} />Bus : Ligne 14 (arrêt Roussel) en face du McDo</li>
          <li><FontAwesomeIcon icon={faSubway} style={{color:'#1976d2',marginRight:8}} />Métro : Ligne M (arrêt CHU Eurasanté) puis bus CO1 Arret "Philipe de Girard" puis 5 min à pied OU bus Liane 2 Arret "Laenec" puis 5 min à pied.</li>
          <li><FontAwesomeIcon icon={faCar} style={{color:'#ff9e3d',marginRight:8}} />Voiture : Parking à proximité</li>
          <li><FontAwesomeIcon icon={faBicycle} style={{color:'#43a047',marginRight:8}} />Vélo : Station V'Lille à 200m</li>
        </ul>
      </div>
    </div>
  );
}

export default InfosPratiques; 