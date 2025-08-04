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
            .select('id, title, description, type, url, youtube_id, user_id, quality_score, themes, thumbnail')
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
          </main>
        </div>
      </div>
    </>
  );
}
