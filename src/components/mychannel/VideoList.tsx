import React, { FC, memo, useCallback } from 'react';
import { Video } from '@/types';
import { parseThemes } from '@/lib/utils';
import styles from './MyChannel.module.css';

const TEXT = {
  noVideos: 'No videos',
  edit: 'Edit',
  delete: 'Delete',
  noThumbnail: 'No thumbnail',
  videoLabelPrefix: 'Video:',
  waitingForVerification: 'Waiting for verification',
  verified : 'Verified',
  refused : 'Refused',
};

interface VideoListProps {
  videos: Video[];
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
}

function safeParseThemes(raw: unknown): string[] {
  try {
    return parseThemes(raw as any);
  } catch {
    return [];
  }
}

const ThemeTags: FC<{ themes: string[] }> = memo(({ themes }) => {
  if (!themes.length) return null;
  return (
    <div className={styles.tagList}>
      {themes.map((t) => (
        <span key={t} className={styles.tagPill}>
          {t}
        </span>
      ))}
    </div>
  );
});

const ActionButtons: FC<{
  video: Video;
  onEdit: (v: Video) => void;
  onDelete: (v: Video) => void;
}> = ({ video, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => onEdit(video), [onEdit, video]);
  const handleDelete = useCallback(() => onDelete(video), [onDelete, video]);
  return (
    <div className={styles.actions}>
      <button type="button" onClick={handleEdit}>
        {TEXT.edit}
      </button>
      <button type="button" onClick={handleDelete}>
        {TEXT.delete}
      </button>
    </div>
  );
};

const Thumbnail: FC<{ title: string; thumbnail?: string | null }> = memo(({ title, thumbnail }) => {
  const placeholder =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="100%" height="100%" fill="#F0F0F0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="100" fill="#666">No thumbnail</text></svg>`
    );

  return (
    <img
      className={styles.videoThumbnail}
      src={thumbnail || placeholder}
      alt={thumbnail ? `thumbnail from ${title}` : TEXT.noThumbnail}
      loading="lazy"
    />
  );
});

const VideoList: FC<VideoListProps> = ({ videos, onEdit, onDelete }) => {
  if (!videos.length) {
    return <div className={styles.textCenter}>{TEXT.noVideos}</div>;
  }

  return (
    <div className={styles.mainContent}>
      {videos.map((v) => {
        const themes = safeParseThemes((v as any).themes);
        return (
          <article key={v.id} className={styles.videoCard} aria-label={`${TEXT.videoLabelPrefix} ${v.title}`}>
            <Thumbnail title={v.title} thumbnail={(v as any).thumbnail ?? null} />
            <div className={styles.videoContent}>
              <header className={styles.videoHeader}>
                <h4 className={styles.videoTitle}>{v.title}</h4>
                {v.description && <p className={styles.videoDescription}>{v.description}</p>}
                {v.is_verified && <p style={{color: 'green'}}>{TEXT.verified}</p>}
                {v.is_refused ? (
                  <div className="refused-message">
                  <p style={{color: 'red'}}>{TEXT.refused}</p>
                  <p style={{color: 'red'}}>{v.refusal_reason}</p>
                  </div>
                ) 
                : 
                !v.is_verified ? <p style={{color: '#caa603ff'}}>{TEXT.waitingForVerification}</p> : null}
              </header>

              <footer className={styles.videoFooter}>
                
                <ThemeTags themes={themes} />
                <ActionButtons video={v} onEdit={onEdit} onDelete={onDelete} />
              </footer>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default memo(VideoList);
