import React from 'react';

function Confidentialite() {
  return (
    <div className="confidentialite" style={{maxWidth:700,margin:'2rem auto',background:'#fff',padding:'2rem',borderRadius:16,boxShadow:'0 2px 16px rgba(0,0,0,0.06)'}}>
      <h2>Politique de confidentialité</h2>
      <p>Le Bar Tabac Le Saint Claude s'engage à respecter la confidentialité des données collectées lors de la participation aux jeux concours.</p>
      <h3>1. Collecte des données</h3>
      <p>Les données collectées sont limitées au strict nécessaire pour la gestion des jeux concours (nom, prénom, email, etc.).</p>
      <h3>2. Utilisation des données</h3>
      <p>Les données ne sont utilisées que pour contacter les gagnants et ne sont jamais transmises à des tiers.</p>
      <h3>3. Sécurité</h3>
      <p>Les données sont stockées de manière sécurisée et ne sont accessibles qu'aux administrateurs du site.</p>
      <h3>4. Droit d'accès et de rectification</h3>
      <p>Vous pouvez demander la suppression ou la modification de vos données à tout moment en contactant l'établissement.</p>
      <p style={{color:'#888',fontSize:'0.95em',marginTop:'2rem'}}>Site fictif réalisé pour démonstration. Aucune activité réelle n'est associée à ce site.</p>
    </div>
  );
}

export default Confidentialite; 