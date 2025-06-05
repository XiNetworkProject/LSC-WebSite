import React from 'react';

function ReglementJeu() {
  return (
    <div className="reglement-jeu" style={{maxWidth:700,margin:'2rem auto',background:'#fff',padding:'2rem',borderRadius:16,boxShadow:'0 2px 16px rgba(0,0,0,0.06)'}}>
      <h2>Règlement du jeu concours</h2>
      <p>Le présent règlement s'applique à tous les jeux concours organisés par le Bar Tabac Le Saint Claude.</p>
      <h3>1. Conditions de participation</h3>
      <ul>
        <li>La participation est gratuite et sans obligation d'achat.</li>
        <li>Réservée aux personnes majeures (18 ans et plus).</li>
        <li>Une seule participation par personne et par jeu.</li>
      </ul>
      <h3>2. Modalités</h3>
      <ul>
        <li>Remplir le formulaire de participation en ligne.</li>
        <li>Accepter le présent règlement et les CGU.</li>
        <li>Le non-respect entraîne l'annulation de la participation.</li>
      </ul>
      <h3>3. Désignation des gagnants</h3>
      <ul>
        <li>Les gagnants sont tirés au sort parmi les participants éligibles.</li>
        <li>Ils seront contactés par email ou téléphone.</li>
      </ul>
      <h3>4. Données personnelles</h3>
      <ul>
        <li>Les données sont utilisées uniquement pour la gestion du jeu.</li>
        <li>Elles ne sont pas transmises à des tiers.</li>
      </ul>
      <h3>5. Acceptation</h3>
      <p>La participation au jeu implique l'acceptation pleine et entière du présent règlement et des CGU.</p>
      <p style={{color:'#888',fontSize:'0.95em',marginTop:'2rem'}}>Site fictif réalisé pour démonstration. Aucune activité réelle n'est associée à ce site.</p>
    </div>
  );
}

export default ReglementJeu; 