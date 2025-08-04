import {
  useState,
  useEffect,
  useCallback,
  FormEvent,
  KeyboardEvent,
  ChangeEvent,
  FC,
  memo,
} from 'react';
import { supabase } from '@/lib/supabase';
import {
  getNativeVideoDuration,
  secondsToISODuration,
} from '@/utils/videoHelpers';
import { Video } from '@/types';
import { XIcon } from '@/components/props/icons';

interface VideoUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingThemes: string[];
  setExistingThemes: React.Dispatch<React.SetStateAction<string[]>>;
  initialFile: File | null;
  editingVideo: Video | null;
}

const TEXT = {
  editVideo: 'Modifier la vidéo',
  publishVideo: 'Publier une vidéo',
  title: 'Titre',
  descriptionOptional: 'Description (facultatif)',
  tagsPlaceholder: 'Tags',
  selectedFile: 'Fichier sélectionné :',
  noThumbnail: 'Aucune miniature',
  thumbnailLabel: 'Miniature',
  cancel: 'Annuler',
  update: 'Enregistrer les modifications',
  publish: 'Publier',
  updating: 'Mise à jour...',
  publishing: 'Publication...',
  themeRemoveAria: (tag: string) => `Supprimer ${tag}`,
  unauthenticated: 'Utilisateur non authentifié',
  noFileSelected: 'Aucun fichier sélectionné',
  errorGeneric: 'Une erreur est survenue. Réessaye plus tard.',
  suggestionsListLabel: 'Suggestions de thèmes',
};

function normalizeThemes(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.filter((t): t is string => typeof t === 'string');
  }
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed.filter((t): t is string => typeof t === 'string');
      }
    } catch {
      return input
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  return [];
}

const THUMBNAIL_BUCKET = 'thumbnails';
const VIDEO_BUCKET = 'videos';

async function uploadFileToBucket(
  bucket: string,
  file: File
): Promise<{ publicUrl: string } | null> {
  const fileName = `${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
  if (uploadError || !uploadData?.path) {
    console.warn(`Erreur upload dans ${bucket}:`, uploadError);
    return null;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
  return { publicUrl };
}

const VideoUploadModal: FC<VideoUploadModalProps> = ({
  open,
  onClose,
  onSuccess,
  existingThemes,
  setExistingThemes,
  initialFile,
  editingVideo,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Cleaning the URL object
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  // Initialize on opening or editing
  useEffect(() => {
    if (!open) return;

    if (editingVideo) {
      setTitle(editingVideo.title);
      setDescription(editingVideo.description || '');
      setTags(normalizeThemes((editingVideo as any).themes));
      setFile(null);
      const existingThumb = (editingVideo as any).thumbnail;
      setThumbnailPreview(existingThumb || null);
      setThumbnailFile(null);
    } else {
      setTitle('');
      setDescription('');
      setTags([]);
      setFile(initialFile);
      setThumbnailFile(null);
      setThumbnailPreview(null);
    }

    setTagInput('');
    setSuggestions([]);
    setError('');
  }, [open, editingVideo, initialFile]);

  const addThemeIfNew = useCallback(
    (newTag: string) => {
      setTags((prev) => {
        if (prev.includes(newTag)) return prev;
        return [...prev, newTag];
      });
      setExistingThemes((prev) => {
        if (prev.includes(newTag)) return prev;
        return [...prev, newTag];
      });
    },
    [setExistingThemes]
  );

  const handleTagKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const newTag = tagInput.replace(/^\/+/, '').trim();
        if (newTag) {
          addThemeIfNew(newTag);
        }
        setTagInput('');
        setSuggestions([]);
      }
    },
    [tagInput, addThemeIfNew]
  );

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleThumbnailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setThumbnailFile(f);
      const url = URL.createObjectURL(f);
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailPreview(url);
    },
    [thumbnailPreview]
  );

  const handleTagInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setTagInput(v);
      if (v.startsWith('/')) {
        const query = v.slice(1).toLowerCase();
        setSuggestions(
          existingThemes.filter((t) =>
            t.toLowerCase().startsWith(query)
          )
        );
      } else {
        setSuggestions([]);
      }
    },
    [existingThemes]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError('');
      setIsUploading(true);

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          throw new Error(TEXT.unauthenticated);
        }
        const user = session.user;

        let thumbnailUrl: string | null = null;
        if (thumbnailFile) {
          const result = await uploadFileToBucket(
            THUMBNAIL_BUCKET,
            thumbnailFile
          );
          if (result?.publicUrl) {
            thumbnailUrl = result.publicUrl;
          }
        }

        if (editingVideo) {
          const updates: Record<string, unknown> = {
            title: title.trim(),
            description: description.trim() || null,
            themes: tags,
            ...(thumbnailUrl ? { thumbnail: thumbnailUrl } : {}),
          };

          const { error: updateError } = await supabase
            .from('videos')
            .update(updates)
            .eq('id', editingVideo.id);

          if (updateError) throw updateError;
        } else {
          if (!file) {
            setError(TEXT.noFileSelected);
            return;
          }

          const videoUpload = await uploadFileToBucket(VIDEO_BUCKET, file);
          if (!videoUpload?.publicUrl) {
            throw new Error("Échec de l'upload de la vidéo");
          }
          const publicUrl = videoUpload.publicUrl;

          let durationIso = '';
          try {
            const durationSeconds = await getNativeVideoDuration(publicUrl);
            durationIso = secondsToISODuration(durationSeconds);
          } catch (e: unknown) {
            console.warn('Impossible de récupérer durée native', e);
          }

          const videoData: Record<string, unknown> = {
            title: title.trim(),
            description: description.trim() || null,
            themes: tags,
            user_id: user.id,
            type: 'native',
            url: publicUrl,
            ...(durationIso ? { duration: durationIso } : {}),
            ...(thumbnailUrl ? { thumbnail: thumbnailUrl } : {}),
          };

          const { error: dbError } = await supabase
            .from('videos')
            .insert([videoData]);

          if (dbError) throw dbError;
        }

        onSuccess();
        onClose();
      } catch (err: any) {
        setError(
          typeof err?.message === 'string'
            ? err.message
            : TEXT.errorGeneric
        );
      } finally {
        setIsUploading(false);
      }
    },
    [
      editingVideo,
      title,
      description,
      tags,
      thumbnailFile,
      file,
      onClose,
      onSuccess,
    ]
  );

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={editingVideo ? TEXT.editVideo : TEXT.publishVideo}>
      <div className="modal-content">
        <div className="modal-inner" style={{ padding: 24 }}>
          <h3 className="modal-title">
            {editingVideo ? TEXT.editVideo : TEXT.publishVideo}
          </h3>
          <form onSubmit={handleSubmit} className="form-column">
            <div className="field-group">
              <label htmlFor="video-title" className="label">
                {TEXT.title}
              </label>
              <input
                id="video-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="field-group">
              <label htmlFor="video-description" className="label">
                {TEXT.descriptionOptional}
              </label>
              <textarea
                id="video-description"
                placeholder={TEXT.descriptionOptional}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea"
              />
            </div>

            <div className="field-group" style={{ position: 'relative' }}>
              <div className="tags-container">
                {tags.map((t) => (
                  <div key={t} className="tag-pill">
                    {t}
                    <button
                      type="button"
                      aria-label={TEXT.themeRemoveAria(t)}
                      onClick={() => removeTag(t)}
                      className="tag-remove-btn"
                    >
                      <XIcon width={12} height={12} />
                    </button>
                  </div>
                ))}
                <input
                  placeholder={TEXT.tagsPlaceholder}
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagKeyDown}
                  className="input-inline"
                  aria-label="Ajout de tag"
                />
              </div>
              {suggestions.length > 0 && (
                <ul className="suggestions-list" aria-label={TEXT.suggestionsListLabel}>
                  {suggestions.map((s) => (
                    <li
                      key={s}
                      role="button"
                      tabIndex={0}
                      onClick={() => addThemeIfNew(s)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addThemeIfNew(s);
                      }}
                      className="suggestion-item"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {file && (
              <div className="field-group">
                <div style={{ fontSize: 14 }}>
                  {TEXT.selectedFile} <strong>{file.name}</strong>
                </div>
              </div>
            )}

            {error && (
              <div className="field-group" role="alert">
                <p style={{ color: 'red' }}>{error}</p>
              </div>
            )}

            <div className="field-group">
              <label htmlFor="thumbnail" className="label">
                {TEXT.thumbnailLabel}
              </label>
              <div className="thumbnail-picker">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Aperçu miniature"
                    className="thumbnail-preview"
                  />
                ) : editingVideo && (editingVideo as any).thumbnail ? (
                  <img
                    src={(editingVideo as any).thumbnail}
                    alt="Miniature existante"
                    className="thumbnail-preview"
                  />
                ) : (
                  <div className="thumbnail-placeholder">
                    {TEXT.noThumbnail}
                  </div>
                )}
                <input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </div>
            </div>

            <div
              className="actions"
              style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}
            >
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isUploading}
              >
                {TEXT.cancel}
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="btn-primary"
                aria-busy={isUploading}
              >
                {isUploading
                  ? editingVideo
                    ? TEXT.updating
                    : TEXT.publishing
                  : editingVideo
                  ? TEXT.update
                  : TEXT.publish}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default memo(VideoUploadModal);
