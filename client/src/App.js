import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Accueil from './pages/Accueil';
import JeuxConcours from './pages/JeuxConcours';
import BarTabac from './pages/BarTabac';
import InfosPratiques from './pages/InfosPratiques';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import CGU from './pages/CGU';
import MentionsLegales from './pages/MentionsLegales';
import Confidentialite from './pages/Confidentialite';
import ReglementJeu from './pages/ReglementJeu';
import './App.css';

function AnimatedBg() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      document.querySelectorAll('.halo, .bokeh').forEach((el, i) => {
        const factor = (i + 1) * 10;
        el.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    };
    if (window.innerWidth > 800) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return (
    <div className="animated-bg">
      <div className="halo halo1"></div>
      <div className="halo halo2"></div>
      <div className="halo halo3"></div>
      <div className="bokeh b1"></div>
      <div className="bokeh b2"></div>
      <div className="bokeh b3"></div>
      <div className="bokeh b4"></div>
      <div className="bokeh b5"></div>
    </div>
  );
}

function isOpenNow(date = new Date()) {
  const day = date.getDay(); // 0 = dimanche, 1 = lundi, ...
  const hour = date.getHours();
  const min = date.getMinutes();
  // Lundi à vendredi : 7h-19h30
  if (day >= 1 && day <= 5) {
    if ((hour > 7 && hour < 19) || (hour === 7 && min >= 0) || (hour === 19 && min <= 30)) return true;
    return false;
  }
  // Samedi : 8h-19h30
  if (day === 6) {
    if ((hour > 8 && hour < 19) || (hour === 8 && min >= 0) || (hour === 19 && min <= 30)) return true;
    return false;
  }
  // Dimanche : 8h30-12h30
  if (day === 0) {
    if ((hour > 8 && hour < 12) || (hour === 8 && min >= 30) || (hour === 12 && min <= 30)) return true;
    return false;
  }
  return false;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const closeMenu = () => setOpen(false);
  const ouvert = isOpenNow();
  return (
    <nav className="navbar">
      <Link to="/" className="logo-link" onClick={closeMenu} style={{display:'flex',alignItems:'center',marginRight:20}}>
        <img src="/logo-saint-claude.png" alt="Logo Saint Claude" className="logo-navbar" style={{height:48, width:'auto', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', background:'#fff'}} />
        <span style={{marginLeft:12, fontWeight:700, color: ouvert ? '#2e8b57' : '#b22222', background: ouvert ? '#e6f7ed' : '#ffeaea', borderRadius:8, padding:'4px 12px', fontSize:'1rem', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          {ouvert ? 'Ouvert' : 'Fermé'}
        </span>
      </Link>
      <div className="burger" onClick={() => setOpen(!open)} aria-label="Ouvrir le menu" tabIndex={0} role="button">
        <span style={{transform: open ? 'rotate(45deg) translate(5px, 5px)' : ''}}></span>
        <span style={{opacity: open ? 0 : 1}}></span>
        <span style={{transform: open ? 'rotate(-45deg) translate(7px, -7px)' : ''}}></span>
      </div>
      <div className={`links${open ? ' open' : ''}`}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>Accueil</Link>
        <Link to="/jeux" className={location.pathname === '/jeux' ? 'active' : ''} onClick={closeMenu}>Jeux concours</Link>
        <Link to="/bar-tabac" className={location.pathname === '/bar-tabac' ? 'active' : ''} onClick={closeMenu}>Le Bar Tabac</Link>
        <Link to="/infos" className={location.pathname === '/infos' ? 'active' : ''} onClick={closeMenu}>Infos pratiques</Link>
        <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''} onClick={closeMenu}>Admin</Link>
      </div>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) setTransitionStage("fadeOut");
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "fadeOut") {
      setDisplayLocation(location);
      setTransitionStage("fadeIn");
    }
  }, [transitionStage, location]);

  return (
    <div className="main-container">
      <Navbar />
      <div className={`content ${transitionStage}`}>
        <Routes location={displayLocation}>
          <Route path="/" element={<Accueil />} />
          <Route path="/jeux" element={<JeuxConcours />} />
          <Route path="/bar-tabac" element={<BarTabac />} />
          <Route path="/infos" element={<InfosPratiques />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/reglement-jeu" element={<ReglementJeu />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AnimatedBg />
      <AppContent />
    </Router>
  );
}

export default App;
