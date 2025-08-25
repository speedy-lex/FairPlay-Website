"use client"

import Head from 'next/head';
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getRecommendedVideos } from '@/lib/recommend';
import { Topbar } from '@/components/Topbar';
import { Sidebar } from '@/components/Sidebar';
import { VideoGridSection } from '@/components/VideoGridSection';
import { fetchYoutubeDuration, parseISODuration } from '@/utils/videoHelpers';
import { parseThemes } from '@/lib/utils';
import type { Video } from '@/types';
import { useRouter } from 'next/router';


export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [loginwithoutpassword, setLoginwithoutpassword] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let vids: any[] = [];
      if (user) {
        vids = await getRecommendedVideos(user.id);
      } else {
        const { data } = await supabase
            .from('videos')
            .select('id, title, description, type, url, youtube_id, user_id, quality_score, themes, duration, thumbnail')
            .order('quality_score', { ascending: false });
        vids = data || [];
      }
      
      const vidsWithDuration = await Promise.all(
        vids.map(async v => {
          let duration = v.duration ?? '';
          if (v.type === 'youtube' && v.youtube_id) {
            duration = await fetchYoutubeDuration(v.youtube_id);
          }
          return { ...v, duration };
        })
      );
      setVideos(vidsWithDuration);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    
    fetchVideos();
    const params = new URLSearchParams(window.location.search);
    const loginwithoutpassword= params.get('loginwithoutpassword');
    if (loginwithoutpassword) {
      setLoginwithoutpassword(true);
    }
    params.delete('loginwithoutpassword');
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    router.replace(newUrl, undefined, { shallow: true });
    }, [fetchVideos]);

  const categories = React.useMemo(() => {
    const all = videos.flatMap(v => parseThemes((v as any).themes));
    const unique = Array.from(new Set(all));
    return ['Tous', ...unique];
  }, [videos]);

  const filteredVideos = selectedCategory === 'Tous'
    ? videos
    : videos.filter(v => parseThemes((v as any).themes).includes(selectedCategory));

  return (
    <>
      <Head>
        <title>FairPlay</title>
        <meta name="description" content="FairPlay is a free platform for sharing, discovering and supporting cultural, scientific and creative videos." />
      </Head>
      <Topbar />
      <div className="container-flex">
        <div className="page-wrapper">
          <Sidebar active="videos" />
          <main className="main-content">
            <VideoGridSection
              loading={loading}
              error={error}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              filteredVideos={filteredVideos}
              parseISODuration={parseISODuration}
              parseThemes={parseThemes}
            />
            {loginwithoutpassword && (
              <div className="popup-overlay" role="dialog" aria-modal="true">
                <div className="popup-content">
                  <h2>Login Successful</h2>
                  <p>You have been logged in without a password. </p>
                  <p>If you forgot your password you can set a new one</p>
                  <button className="button" onClick={() => setLoginwithoutpassword(false)}>Close</button>
                  <button className="buttonWhite" onClick={() => router.push("/resetpassword")}>Change My Passyord</button>
                </div>
                </div>
            )}
          </main>
        </div>
      </div>
      <style jsx global>{`
        .popup-overlay {
         position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .popup-content {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          min-width: 300px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          position: relative;
        }
          .button {
         
          padding: 0.8rem;
          border: none;
          border-radius: 8px;
          background-color: var(--color-accent);
          color: var(--color-white);
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background-color .2s ease, transform .02s ease;}

          .button:hover {background-color: var(--color-accent-dark); transform: scale(1.02);}

          .button:active {background-color: var(--color-accent-darker); transform: scale(0.98);}

          .buttonWhite {
          padding: 0.8rem;
          border: 1px solid var(--color-accent);
          border-radius: 8px;
          background-color: var(--color-white);
          color: var(--color-accent);
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          margin-top: 0.5rem;
          margin-left: 1rem;
          margin-right: 1rem;
          transition: background-color .2s ease, transform .02s ease;}
      `}</style>
    </>
  );
}
