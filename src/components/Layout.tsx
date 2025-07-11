'use client';
import React from 'react';
import Head from 'next/head';
import {
  FontAwesomeIcon
} from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faHome,
  faCompass,
  faGlobe,
  faBell,
  faHistory,
  faUserCircle,
  faAward,
  faBookOpen,
  faGamepad,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import './layoutStyle.css';

type Props = {
  active: string;
  onCreateClick: () => void;
  children?: React.ReactNode;
};

const TopbarSidebar: React.FC<Props> = ({ active, onCreateClick, children }) => (
  <>
    <Head>
      {/* */}
      <></>
    </Head>

    {/* Topbar */}
    <header className="main-header">
      <div className="container">
        <h1 className="logo">
          <a href="/">FairPlay</a>
        </h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher des vidéos éthiques..."
          />
          <button type="submit">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <nav className="main-nav">
          <ul>
            <li>
              <a href="/" className={active === 'home' ? 'active' : ''}>
                Accueil
              </a>
            </li>
            <li>
              <a href="/videos" className={active === 'videos' ? 'active' : ''}>
                Recommandations
              </a>
            </li>
            <li>
              <a href="/explore" className={active === 'explore' ? 'active' : ''}>
                Explorer
              </a>
            </li>
            <li>
              <a href="/subscriptions" className={active === 'subscriptions' ? 'active' : ''}>
                S'abonner
              </a>
            </li>
            <li>
              <a href="/channel" className={active === 'channel' ? 'active' : ''}>
                Ma Chaîne
              </a>
            </li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="donate-button">Faire un don</button>
          <button className="create-button" onClick={onCreateClick}>
            <FontAwesomeIcon icon={faPlus} /> Créer
          </button>
        </div>
      </div>
    </header>

    {/* Sidebar + zone principale */}
    <div className="page-wrapper container">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li>
              <a href="/" className={active === 'home' ? 'active' : ''}>
                <FontAwesomeIcon icon={faHome} className="sidebarIcon" /> Accueil
              </a>
            </li>
            <li>
              <a href="/videos" className={active === 'videos' ? 'active' : ''}>
                <FontAwesomeIcon icon={faCompass} className="sidebarIcon" /> Recommandations
              </a>
            </li>
            <li>
              <a href="/explore" className={active === 'explore' ? 'active' : ''}>
                <FontAwesomeIcon icon={faGlobe} className="sidebarIcon" /> Explorer
              </a>
            </li>
            <li>
              <a href="/subscriptions" className={active === 'subscriptions' ? 'active' : ''}>
                <FontAwesomeIcon icon={faBell} className="sidebarIcon" /> Abonnements
              </a>
            </li>
            <li>
              <a href="/history" className={active === 'history' ? 'active' : ''}>
                <FontAwesomeIcon icon={faHistory} className="sidebarIcon" /> Historique
              </a>
            </li>
            <li>
              <a href="/channel" className={active === 'channel' ? 'active' : ''}>
                <FontAwesomeIcon icon={faUserCircle} className="sidebarIcon" /> Ma Chaîne
              </a>
            </li>
          </ul>

          {/* Sections supplémentaires */}
          <div className="sidebar-section">
            <h4>Abonnements</h4>
            <ul>
              <li>
                <a href="#">
                  <img src="https://via.placeholder.com/24x24?text=C1" alt="Chaîne 1" /> Chaîne 1
                </a>
              </li>
              <li>
                <a href="#">
                  <img src="https://via.placeholder.com/24x24?text=C2" alt="Chaîne 2" /> Chaîne 2
                </a>
              </li>
              <li>
                <a href="#">
                  <img src="https://via.placeholder.com/24x24?text=C3" alt="Chaîne 3" /> Chaîne 3
                </a>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h4>Plus de FairPlay</h4>
            <ul>
              <li>
                <a href="#" className={active === 'popular' ? 'active' : ''}>
                  <FontAwesomeIcon icon={faAward} className="sidebarIcon" /> Populaire
                </a>
              </li>
              <li>
                <a href="#" className={active === 'learning' ? 'active' : ''}>
                  <FontAwesomeIcon icon={faBookOpen} className="sidebarIcon" /> Apprentissage
                </a>
              </li>
              <li>
                <a href="#" className={active === 'gaming' ? 'active' : ''}>
                  <FontAwesomeIcon icon={faGamepad} className="sidebarIcon" /> Gaming
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  </>
);

export { TopbarSidebar as Layout };
