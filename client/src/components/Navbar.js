import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faHome, faTrophy, faInfoCircle, faUserShield } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-burger" onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} size="lg" />
      </div>
      <ul className={menuOpen ? 'navbar-links open' : 'navbar-links'}>
        <li><a href="/"><FontAwesomeIcon icon={faHome} style={{marginRight:6}} />Accueil</a></li>
        <li><a href="/jeux"><FontAwesomeIcon icon={faTrophy} style={{marginRight:6}} />Jeux concours</a></li>
        <li><a href="/infos"><FontAwesomeIcon icon={faInfoCircle} style={{marginRight:6}} />Infos pratiques</a></li>
        <li><a href="/admin"><FontAwesomeIcon icon={faUserShield} style={{marginRight:6}} />Admin</a></li>
      </ul>
    </nav>
  );
};

export default Navbar; 