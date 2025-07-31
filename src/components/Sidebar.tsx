'use client'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCompass,
  faBell,
  faHistory,
  faUserCircle,
  faAward,
  faBookOpen,
  faGamepad,
  faGlobe
} from '@fortawesome/free-solid-svg-icons'

type Props = {
  active: string
}

export const Sidebar: React.FC<Props> = ({ active }) => (
  <aside className="sidebar">
    <nav className="sidebar-nav">
      <ul>
        <li>
          <Link href="/" className={active === 'videos' ? 'active' : ''}>
            <FontAwesomeIcon icon={faCompass} className="sidebarIcon" /> Explore
          </Link>
        </li>
        <li>
          <Link href="/offline" className={active === 'offline' ? 'active' : ''}>
            <FontAwesomeIcon icon={faGlobe} className="sidebarIcon" /> Offline
          </Link>
        </li>
        <li>
          <Link href="/subscriptions" className={active === 'subscriptions' ? 'active' : ''}>
            <FontAwesomeIcon icon={faBell} className="sidebarIcon" /> Subscriptions
          </Link>
        </li>
        <li>
          <Link href="/history" className={active === 'history' ? 'active' : ''}>
            <FontAwesomeIcon icon={faHistory} className="sidebarIcon" /> History
          </Link>
        </li>
        <li>
          <Link href="/mychannel" className={active === 'channel' ? 'active' : ''}>
            <FontAwesomeIcon icon={faUserCircle} className="sidebarIcon" /> My Channel
          </Link>
        </li>
      </ul>
      <div className="sidebar-section">
        <h4>Subscriptions</h4>
        <ul>
          <li>
            <a href="#">
              <img src="https://via.placeholder.com/24x24?text=C1" alt="Chaîne 1" /> Channel 1
            </a>
          </li>
          <li>
            <a href="#">
              <img src="https://via.placeholder.com/24x24?text=C2" alt="Chaîne 2" /> Channel 2
            </a>
          </li>
          <li>
            <a href="#">
              <img src="https://via.placeholder.com/24x24?text=C3" alt="Chaîne 3" /> Channel 3
            </a>
          </li>
        </ul>
      </div>
      <div className="sidebar-section">
        <h4>More of FairPlay</h4>
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
