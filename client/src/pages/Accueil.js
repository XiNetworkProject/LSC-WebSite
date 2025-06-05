import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

function Accueil() {
  return (
    <div className="accueil">
      <img src="/logo-saint-claude.png" alt="Logo Saint Claude" style={{maxWidth:320, marginBottom:24, borderRadius:20, boxShadow:'0 4px 32px rgba(46,139,87,0.10)', background:'#fff'}} />
      <h1 style={{fontSize:'2.5rem',fontWeight:800,letterSpacing:'-1px',marginBottom:16}}>
        <FontAwesomeIcon icon={faHome} style={{color:'#ff9e3d',marginRight:10}} />Bienvenue au Saint Claude
      </h1>
      <div style={{maxWidth:500,margin:'0 auto 24px',color:'#444',fontSize:'1.2rem',background:'rgba(255,255,255,0.85)',borderRadius:12,padding:'1.2rem 1rem',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
        Votre bar tabac à Wattignies : jeux, convivialité et détente !<br/>
        <span style={{color:'#2e8b57',fontWeight:600}}>PMU, FDJ, presse, et bien plus encore…</span>
      </div>
    </div>
  );
}

export default Accueil; 