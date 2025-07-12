'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons'
import './layoutStyle.css'

type Props = {
  active: string
  onCreateClick?: () => void
}

export const Topbar: React.FC<Props> = ({ active, onCreateClick }) => (
  <header className="main-header">
    <div className="container">
      <h1 className="logo">
        <a href="https://newstreamteam.github.io/NewStream-Main/">FairPlay</a>
      </h1>
      <div className="search-bar">
        <input type="text" placeholder="Search videos..." />
        <button type="submit">
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
      <nav className="main-nav">
        <ul>
          <li>
            <a href="/" className={active === 'home' ? 'active' : ''}>
              Home
            </a>
          </li>
          <li>
            <a href="/videos" className={active === 'videos' ? 'active' : ''}>
              Feed
            </a>
          </li>
          <li>
            <a href="/explore" className={active === 'explore' ? 'active' : ''}>
              Explore
            </a>
          </li>
          <li>
            <a href="/subscriptions" className={active === 'subscriptions' ? 'active' : ''}>
              Subscriptions
            </a>
          </li>
          <li>
            <a href="/channel" className={active === 'channel' ? 'active' : ''}>
              My Channel
            </a>
          </li>
        </ul>
      </nav>
      <div className="header-actions">
        <button className="donate-button">Donate</button>
        <button className="create-button" onClick={onCreateClick}>
          <FontAwesomeIcon icon={faPlus} /> Create
        </button>
      </div>
    </div>
  </header>
)