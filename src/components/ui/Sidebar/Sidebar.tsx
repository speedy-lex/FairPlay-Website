'use client'
import { useEffect, useState, ChangeEvent, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
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


export const Sidebar: React.FC<Props> = ({ active }) => {
  // === Utils ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getSessionUser = useCallback(async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return null;
    return session.user;
  }, []);

  useEffect(() => {
    getSessionUser().then(user => setIsLoggedIn(user !== null));
  }, [getSessionUser]);

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link href="/feed" className={active === 'videos' ? 'active' : ''}>
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
          {isLoggedIn && (
            <li>
              <Link href="/mychannel" className={active === 'channel' ? 'active' : ''}>
                <FontAwesomeIcon icon={faUserCircle} className="sidebarIcon" /> My Channel
              </Link>
            </li>
          )}
        </ul>
        {isLoggedIn && (<div className="sidebar-section">
          <h4>Subscriptions</h4>
          <ul>
            <li>
              <Link href="#">
                <img src="https://placehold.co/24x24?text=C1" alt="Chaîne 1" /> Channel 1
              </Link>
            </li>
            <li>
              <Link href="#">
                <img src="https://placehold.co/24x24?text=C2" alt="Chaîne 2" /> Channel 2
              </Link>
            </li>
            <li>
              <Link href="#">
                <img src="https://placehold.co/24x24?text=C3" alt="Chaîne 3" /> Channel 3
              </Link>
            </li>
          </ul>
        </div>
        )}
        <div className="sidebar-section">
          <h4>More of FairPlay</h4>
          <ul>
            <li>
              <Link href="/trending" className={active === 'popular' ? 'active' : ''}>
                <FontAwesomeIcon icon={faAward} className="sidebarIcon" /> Trending
              </Link>
            </li>
            <li>
              <Link href="/learning" className={active === 'learning' ? 'active' : ''}>
                <FontAwesomeIcon icon={faBookOpen} className="sidebarIcon" /> Learning
              </Link>
            </li>
            <li>
              <Link href="/gaming" className={active === 'gaming' ? 'active' : ''}>
                <FontAwesomeIcon icon={faGamepad} className="sidebarIcon" /> Gaming
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}