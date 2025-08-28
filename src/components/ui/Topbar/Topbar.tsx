'use client';
import React, { useEffect, useState, useCallback} from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';
import styles from './Topbar.module.css';

export const Topbar: React.FC = () => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setIsAuthed(!!session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
    const handleLogout = useCallback(async () => {
      await supabase.auth.signOut();
      window.location.href = '/feed';
  }, []);

  return (
    <header className="main-header">
      <div className="container">
        <h1 className={styles.logo}>
          <a href="/">FairPlay</a>
        </h1>

        <div className={styles.searchBar}>
          <input type="text" placeholder="Search videos..." />
          <button type="submit" aria-label="Search">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <div className={styles.headerActions}>
          {!isAuthed && (
            <>
            <a href="/login" className={styles.loginButton}>Login</a>
            <a href="/login?register=true" className={styles.loginButton}>SignUp</a>
            </>
          )}
          {isAuthed && (
            <button type="button" className={styles.loginButton} onClick={handleLogout}>Log Out</button>
          )}
          <button
            className={styles.donateButton}
            onClick={() => window.open("https://ko-fi.com/fairplay_", "_blank")}
          >
            Donate
          </button>
        </div>
      </div>
    </header>
  );
};
