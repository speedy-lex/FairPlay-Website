'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons'

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
      <div className="header-actions">
        <button className="donate-button">Donate</button>
      </div>
    </div>
  </header>
)