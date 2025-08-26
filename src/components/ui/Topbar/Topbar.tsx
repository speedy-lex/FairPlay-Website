'use client';
import React, { useEffect, useState, useCallback} from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';

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
        <h1 className="logo">
          <a href="/">FairPlay</a>
        </h1>

        <div className="search-bar">
          <input type="text" placeholder="Search videos..." />
          <button type="submit" aria-label="Search">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <div className="header-actions">
          {!isAuthed && (
            <a href="/login" className="login-button">Login</a>
          )}
          {isAuthed && (
            <button type="button" className="login-button" onClick={handleLogout}>Log Out</button>
          )}
          <button
            className="donate-button"
            onClick={() => window.open("https://ko-fi.com/fairplay_", "_blank")}
          >
            Donate
          </button>
        </div>
      </div>
    </header>
  );
};
