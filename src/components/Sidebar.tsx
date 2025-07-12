'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faCompass,
  faGlobe,
  faBell,
  faHistory,
  faUserCircle,
  faAward,
  faBookOpen,
  faGamepad
} from '@fortawesome/free-solid-svg-icons'
import './layoutStyle.css'

type Props = {
  active: string
}

export const Sidebar: React.FC<Props> = ({ active }) => (
  <aside className="sidebar">
    <nav className="sidebar-nav">
      <ul>
        <li>
          <a href="/" className={active === 'home' ? 'active' : ''}>
            <FontAwesomeIcon icon={faHome} className="sidebarIcon" /> Home
          </a>
        </li>
        <li>
          <a href="/videos" className={active === 'videos' ? 'active' : ''}>
            <FontAwesomeIcon icon={faCompass} className="sidebarIcon" /> Feed
          </a>
        </li>
        <li>
          <a href="/explore" className={active === 'explore' ? 'active' : ''}>
            <FontAwesomeIcon icon={faGlobe} className="sidebarIcon" /> Explore
          </a>
        </li>
        <li>
          <a href="/subscriptions" className={active === 'subscriptions' ? 'active' : ''}>
            <FontAwesomeIcon icon={faBell} className="sidebarIcon" /> Subscriptions
          </a>
        </li>
        <li>
          <a href="/history" className={active === 'history' ? 'active' : ''}>
            <FontAwesomeIcon icon={faHistory} className="sidebarIcon" /> History
          </a>
        </li>
        <li>
          <a href="/channel" className={active === 'channel' ? 'active' : ''}>
            <FontAwesomeIcon icon={faUserCircle} className="sidebarIcon" /> My Channel
          </a>
        </li>
      </ul>
      <div className="sidebar-section">
        <h4>Abonnements</h4>
        <ul>
          <li>
            <a href="#">
              <img src="https://via.placeholder.com/24x24?text=C1" alt="Cha\u00eene 1" /> Channel 1
            </a>
          </li>
          <li>
            <a href="#">
              <img src="https://via.placeholder.com/24x24?text=C2" alt="Cha\u00eene 2" /> Channel 2
            </a>
          </li>
          <li>
            <a href="#">
              <img src="https://via.placeholder.com/24x24?text=C3" alt="Cha\u00eene 3" /> Channel 3
            </a>
          </li>
        </ul>
      </div>
      <div className="sidebar-section">
        <h4>Plus de FairPlay</h4>
        <ul>
          <li>
            <a href="#" className={active === 'popular' ? 'active' : ''}>
              <FontAwesomeIcon icon={faAward} className="sidebarIcon" /> Trending
            </a>
          </li>
          <li>
            <a href="#" className={active === 'learning' ? 'active' : ''}>
              <FontAwesomeIcon icon={faBookOpen} className="sidebarIcon" /> Learning
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
)
