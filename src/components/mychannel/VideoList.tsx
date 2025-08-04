import { Video } from '@/types';
import { parseThemes } from '@/lib/utils';
import React, { useMemo, useCallback, FC, memo } from 'react';

const TEXT = {
  noVideos: 'Aucune vidéo à afficher.',
  edit: 'Modifier',
  delete: 'Supprimer',
  noThumbnail: 'Pas de miniature',
  videoLabelPrefix: 'Vidéo :',
};

interface VideoListProps {
  videos: Video[];
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
}

interface ThumbnailProps {
  title: string;
  thumbnail?: string;
}

const Thumbnail: FC<ThumbnailProps> = memo(({ title, thumbnail }) => {
  return (
    <div className="thumbnail-wrapper">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={`Miniature de ${title}`}
          className="thumbnail-image"
        />
      ) : (
        <div
          className="thumbnail-placeholder"
          aria-label={TEXT.noThumbnail}
          role="img"
        >
          {TEXT.noThumbnail}
        </div>
      )}
    </div>
  );
});

interface ThemeTagsProps {
  themes: string[];
}

const ThemeTags: FC<ThemeTagsProps> = memo(({ themes }) => {
  if (themes.length === 0) return null;
  return (
    <div className="theme-tags">
      {themes.map((t) => (
        <span key={t} className="tag-pill">
          {t}
        </span>
      ))}
    </div>
  );
});

interface ActionButtonsProps {
  video: Video;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
}

const ActionButtons: FC<ActionButtonsProps> = ({ video, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => onEdit(video), [onEdit, video]);
  const handleDelete = useCallback(() => onDelete(video), [onDelete, video]);

  return (
    <div className="action-buttons">
      <button type="button" onClick={handleEdit} className="btn edit">
        {TEXT.edit}
      </button>
      <button type="button" onClick={handleDelete} className="btn delete">
        {TEXT.delete}
      </button>
    </div>
  );
};

const VideoList: FC<VideoListProps> = ({ videos, onEdit, onDelete }) => {
  if (videos.length === 0) {
    return <div className="video-list-empty">{TEXT.noVideos}</div>;
  }

  return (
    <div className="video-list">
      {videos.map((v) => {
        // Pre-calculate themes with error handling
        const themes = useMemo<string[]>(() => {
          try {
            return parseThemes(v.themes);
          } catch {
            return [];
          }
        }, [v.themes]);

        return (
          <div
            key={v.id}
            className="video-card"
            aria-label={`${TEXT.videoLabelPrefix} ${v.title}`}
          >
            <div className="video-header">
              <Thumbnail title={v.title} thumbnail={v.thumbnail ?? undefined} />
              <div className="video-info">
                <h4 className="video-title">{v.title}</h4>
                {v.description && (
                  <p className="video-description">{v.description}</p>
                )}
                <ThemeTags themes={themes} />
              </div>
            </div>
            <ActionButtons video={v} onEdit={onEdit} onDelete={onDelete} />
          </div>
        );
      })}
    </div>
  );
};

export default memo(VideoList);
