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
  faGamepad
} from '@fortawesome/free-solid-svg-icons';
import './layoutStyle.css';

type Props = {
  children?: React.ReactNode;
};

const TopbarSidebar: React.FC<Props> = ({ children }) => (
  <>
    <Head>
      {/* ... */}
      <>
      </>
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
            <li><a href="#">Accueil</a></li>
            <li><a href="/videos" className="active">Recommandations</a></li>
            <li><a href="#">Explorer</a></li>
            <li><a href="#">S'abonner</a></li>
            <li><a href="#">Ma Chaîne</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="donate-button">Faire un don</button>
        </div>
      </div>
    </header>

    {/* Sidebar + zone principale */}
    <div className="page-wrapper container">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li>
              <a href="#">
                <FontAwesomeIcon icon={faHome} className="sidebarIcon"/> Accueil
              </a>
            </li>
            <li>
              <a href="/videos" className="active">
                <FontAwesomeIcon icon={faCompass} className="sidebarIcon"/> Recommandations
              </a>
            </li>
            <li>
              <a href="#">
                <FontAwesomeIcon icon={faGlobe} className="sidebarIcon"/> Explorer
              </a>
            </li>
            <li>
              <a href="#">
                <FontAwesomeIcon icon={faBell} className="sidebarIcon"/> Abonnements
              </a>
            </li>
            <li>
              <a href="#">
                <FontAwesomeIcon icon={faHistory} className="sidebarIcon"/> Historique
              </a>
            </li>
            <li>
              <a href="#">
                <FontAwesomeIcon icon={faUserCircle} className="sidebarIcon"/> Ma Chaîne
              </a>
            </li>
          </ul>

          <div className="sidebar-section">
            <h4>Abonnements</h4>
            <ul>
              <li>
                <a href="#">
                  <img
                    src="https://via.placeholder.com/24x24?text=C1"
                    alt="Icône chaîne"
                  />{' '}
                  Chaîne 1
                </a>
              </li>
              <li>
                <a href="#">
                  <img
                    src="https://via.placeholder.com/24x24?text=C2"
                    alt="Icône chaîne"
                  />{' '}
                  Chaîne 2
                </a>
              </li>
              <li>
                <a href="#">
                  <img
                    src="https://via.placeholder.com/24x24?text=C3"
                    alt="Icône chaîne"
                  />{' '}
                  Chaîne 3
                </a>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h4>Plus de FairPlay</h4>
            <ul>
              <li>
                <a href="#"><FontAwesomeIcon icon={faAward} className="sidebarIcon"/> Populaire</a>
              </li>
              <li>
                <a href="#"><FontAwesomeIcon icon={faBookOpen} className="sidebarIcon"/> Apprentissage</a>
              </li>
              <li>
                <a href="#"><FontAwesomeIcon icon={faGamepad} className="sidebarIcon"/> Gaming</a>
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
