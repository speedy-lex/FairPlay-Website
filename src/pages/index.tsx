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

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

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
          .select('id, title, description, type, url, youtube_id, quality_score, themes')
          .order('created_at', { ascending: false });
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
  }, [fetchVideos]);

  const handleUploadSuccess = () => { // not used for now (the upload modal was removed for the MVP)
    fetchVideos();
  };

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
        <title>FairPlay – Partagez et découvrez des vidéos de qualité</title>
        <meta name="description" content="FairPlay est une plateforme libre pour partager, découvrir et soutenir des vidéos culturelles, scientifiques et créatives." />
      </Head>
      <Topbar active="videos" onCreateClick={() => setShowUploadModal(true)} />
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
        </main>
        </div>
      </div>
    </>
  );
}