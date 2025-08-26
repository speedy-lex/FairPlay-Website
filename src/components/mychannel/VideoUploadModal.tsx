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
import { getNativeVideoDuration, secondsToISODuration } from '@/utils/videoHelpers';
import { Video } from '@/types';
import { XIcon } from '@/components/icons';
import { useToast } from '@/components/ui/Toast/Toast';
import styles from './MyChannel.module.css';

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
  if (Array.isArray(input)) return input.filter((t): t is string => typeof t === 'string');
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [];
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

type UploadResult = { publicUrl: string; path: string } | null;

async function uploadFileToBucket(bucket: string, file: File): Promise<UploadResult> {
  const cleanName = sanitizeFileName(file.name);
  const fileName = `${Date.now()}_${cleanName}`;
  const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
  if (uploadError || !uploadData?.path) {
    console.warn(`Erreur upload dans ${bucket}:`, uploadError);
    return null;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
  return { publicUrl, path: uploadData.path };
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
  const { error: toastError, success: toastSuccess, info: toastInfo } = useToast();

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
  const [is_uploading_enable, setisuploadingenable] = useState(true);

  // Cleanup preview URL on unmount/change
  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  // Initialize form when opening or switching mode
  useEffect(() => {
    if (!open) return;

    // Wrap async logic in an IIFE
    (async () => {
      // Exemple pour récupérer la variable globale
      const { data, error } = await supabase
        .from('settings')
        .select('bool_value')
        .eq('name', 'is_uploading_enable')
        .single();
      
      console.log('data.bool_value:', data?.bool_value, typeof data?.bool_value);

      if (data?.bool_value == true) {
        setisuploadingenable(true);
      }
      else {
        setisuploadingenable(false);
      }

      if (editingVideo) {
        setTitle(editingVideo.title);
        setDescription(editingVideo.description || '');
        setTags(normalizeThemes((editingVideo as any).themes));
        setFile(null);
        const existingThumb = (editingVideo as any).thumbnail as string | undefined;
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
    })();
  }, [open, editingVideo, initialFile]);

  const addThemeIfNew = useCallback(
    (newTag: string) => {
      const clean = newTag.trim();
      if (!clean) return;
      setTags((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
      setExistingThemes((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    },
    [setExistingThemes]
  );

  const handleTagKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const newTag = tagInput.replace(/^\/+/, '').trim();
        if (newTag) addThemeIfNew(newTag);
        setTagInput('');
        setSuggestions([]);
      }
    },
    [tagInput, addThemeIfNew]
  );

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleThumbnailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnailFile(f);
    const url = URL.createObjectURL(f);
    if (thumbnailPreview?.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(url);
  }, [thumbnailPreview]);

  const handleTagInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setTagInput(v);
      if (v.startsWith('/')) {
        const query = v.slice(1).toLowerCase();
        setSuggestions(existingThemes.filter((t) => t.toLowerCase().startsWith(query)));
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

      const cleanTitle = title.trim();
      if (!cleanTitle) {
        const msg = 'Le titre est requis';
        setError(msg);
        toastError(msg);
        return;
      }
      if (!is_uploading_enable) {
        toastInfo('La publication est désactivée pour le moment.');
        return;
      }
      
      setIsUploading(true);
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session?.user) throw new Error(TEXT.unauthenticated);
        const user = session.user;

        let thumbnailUrl: string | null = null;
        if (thumbnailFile) {
          const result = await uploadFileToBucket(THUMBNAIL_BUCKET, thumbnailFile);
          console.log('result',result);
          console.log('result public url',result?.publicUrl)
          if (result?.publicUrl) thumbnailUrl = result.publicUrl;
          else toastInfo("Miniature non enregistrée (problème d'upload).");
        }

        if (editingVideo) {
          const updates: Record<string, unknown> = {
            title: cleanTitle,
            description: description.trim() || null,
            themes: tags,
            ...(thumbnailUrl ? { thumbnail: thumbnailUrl } : {}),
          };

          const { error: updateError } = await supabase.from('videos').update(updates).eq('id', editingVideo.id);
          if (updateError) throw updateError;

          toastSuccess('Vidéo mise à jour.');
        } else {
          if (!file) {
            const msg = TEXT.noFileSelected;
            setError(msg);
            toastError(msg);
            return;
          }

          const videoUpload = await uploadFileToBucket(VIDEO_BUCKET, file);
          if (!videoUpload?.publicUrl || !videoUpload.path) throw new Error("Échec de l'upload de la vidéo");

          let durationIso = '';
          try {
            const durationSeconds = await getNativeVideoDuration(videoUpload.publicUrl);
            durationIso = secondsToISODuration(durationSeconds);
          } catch (e: unknown) {
            console.warn('Impossible de récupérer durée native', e);
          }

          const videoData: Record<string, unknown> = {
            title: cleanTitle,
            description: description.trim() || null,
            themes: tags,
            user_id: user.id,
            type: 'native',
            url: videoUpload.publicUrl,
            storage_path: videoUpload.path, // for suppression later
            ...(durationIso ? { duration: durationIso } : {}),
            ...(thumbnailUrl ? { thumbnail: thumbnailUrl } : {}),
          };

          const { error: dbError } = await supabase.from('videos').insert([videoData]);
          if (dbError) throw dbError;

          toastSuccess('Vidéo publiée.');
        }

        onSuccess();
        onClose();
      } catch (err: any) {
        const msg = typeof err?.message === 'string' ? err.message : TEXT.errorGeneric;
        setError(msg);
        toastError(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [editingVideo, title, description, tags, thumbnailFile, file, onClose, onSuccess, toastError, toastSuccess, toastInfo]
  );

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>{editingVideo ? TEXT.editVideo : TEXT.publishVideo}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label htmlFor="video-title" className={styles.label}>{TEXT.title}</label>
            <input id="video-title" value={title} onChange={(e) => setTitle(e.target.value)} className={styles.input} />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="video-description" className={styles.label}>{TEXT.descriptionOptional}</label>
            <textarea id="video-description" value={description} onChange={(e) => setDescription(e.target.value)} className={styles.textarea} />
          </div>
          <div className={styles.fieldGroup}>
            <div className={styles.tagsContainer}>
              {tags.map((t) => (
                <div key={t} className={styles.tagPill}>
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className={styles.tagRemoveBtn}>
                    <XIcon width={12} height={12} />
                  </button>
                </div>
              ))}
              <input
                placeholder={TEXT.tagsPlaceholder}
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="thumbnail" className={styles.label}>{TEXT.thumbnailLabel}</label>
            <div className={styles.thumbnailPicker}>
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Aperçu" className={styles.thumbnailPreview} />
              ) : (
                <div className={styles.thumbnailPlaceholder}>{TEXT.noThumbnail}</div>
              )}
              <input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} />
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.btnSecondary}>{TEXT.cancel}</button>
            <button type="submit" disabled={isUploading} className={styles.btnPrimary}>
              {isUploading ? (editingVideo ? TEXT.updating : TEXT.publishing) : editingVideo ? TEXT.update : TEXT.publish}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(VideoUploadModal);

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD') // enlève les accents
    .replace(/[\u0300-\u036f]/g, '') // enlève les diacritiques
    .replace(/[^a-zA-Z0-9._-]/g, '_'); // remplace tout sauf lettres, chiffres, . _ -
}
