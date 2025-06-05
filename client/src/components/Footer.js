import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{
      background: 'rgba(255,255,255,0.92)',
      borderTop: '1px solid #eee',
      padding: '2rem 0 1rem 0',
      marginTop: '3rem',
      textAlign: 'center',
      fontSize: '1rem',
      boxShadow: '0 -2px 16px rgba(0,0,0,0.04)',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap'}}>
        <Link to="/cgu" style={{color: '#2e8b57', textDecoration: 'none', fontWeight: 600}}>Conditions d'utilisation</Link>
        <Link to="/mentions-legales" style={{color: '#2e8b57', textDecoration: 'none', fontWeight: 600}}>Mentions légales</Link>
        <Link to="/confidentialite" style={{color: '#2e8b57', textDecoration: 'none', fontWeight: 600}}>Confidentialité</Link>
        <Link to="/reglement-jeu" style={{color: '#2e8b57', textDecoration: 'none', fontWeight: 600}}>Règlement du jeu</Link>
      </div>
      <div style={{color: '#888', fontSize: '0.98em'}}>
        © {new Date().getFullYear()} Bar Tabac Le Saint Claude, Wattignies — Site fictif à but de démonstration
      </div>
    </footer>
  );
}

export default Footer; 