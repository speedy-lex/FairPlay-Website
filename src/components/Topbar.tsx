'use client';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';

export const Topbar: React.FC = () => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

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
          <button className="donate-button">Donate</button>
        </div>
      </div>
    </header>
  );
};
