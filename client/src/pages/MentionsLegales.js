import React from 'react';

function MentionsLegales() {
  return (
    <div className="mentions-legales" style={{maxWidth:700,margin:'2rem auto',background:'#fff',padding:'2rem',borderRadius:16,boxShadow:'0 2px 16px rgba(0,0,0,0.06)'}}>
      <h2>Mentions légales</h2>
      <p><b>Éditeur du site :</b><br/>
      Bar Tabac - Le Saint Claude<br/>
      176 Rue Clemenceau, 59139 Wattignies<br/>
      Tél : 03 20 95 00 02<br/>
       </p>
      <p><b>Directeur de la publication :</b><br/>
       </p>
      <p><b>Hébergement :</b><br/>
      OVH SAS, 2 rue Kellermann, 59100 Roubaix, France</p>
      <p><b>Propriété intellectuelle :</b><br/>
      Le contenu de ce site est fictif et à but de démonstration. Toute reproduction est interdite.</p>
      <p><b>Responsabilité :</b><br/>
      Ce site ne collecte aucune donnée personnelle à des fins commerciales. Les informations sont fictives.</p>
      <p style={{color:'#888',fontSize:'0.95em',marginTop:'2rem'}}>Site fictif réalisé pour démonstration. Aucune activité réelle n'est associée à ce site.</p>
    </div>
  );
}

export default MentionsLegales; 