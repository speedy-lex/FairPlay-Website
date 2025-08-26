"use client"

import { useEffect, useState, ChangeEvent, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase';
import VideoUploadModal from '@/components/mychannel/VideoUploadModal';
import VideoList from '@/components/mychannel/VideoList';
import { parseThemes } from '@/lib/utils';
import { Video } from '@/types';
import { ToastProvider, useToast } from '@/components/ui/Toast/Toast';
import styles from './mychannel.module.css';
import { Topbar } from '@/components/ui/Topbar/Topbar'
import { Sidebar } from '@/components/ui/Sidebar/Sidebar'

type ProfileData = {
  username: string;
  avatar_url: string | null;
};

type Tab = 'stats' | 'videos' | 'customization';

const TEXT = {
  loadingProfile: 'Loading profile...',
  unableToLoadProfile: 'Unable to load profile.',
  myChannelStats: "My Channel Stats",
  totalViews: 'Total Views',
  subscribers: 'Subscribers',
  publishedVideos: 'Published Videos',
  manageVideos: 'Manage Videos',
  dropzoneActive: 'Drop your video here...',
  dropzoneIdle: 'Drag and drop a video or click to select one',
  noVideos: 'No videos published.',
  customizeChannel: 'Customize your channel',
  channelBanner: "Channel Banner",
  edit: 'Edit',
  profileImage: 'Profile Image',
  channelName: 'Channel Name',
  channelHandle: 'Handle (@)',
  saveChanges: 'Save Changes',
  saving: 'Saving...',
  logout: 'Log Out',
  tabs: {
    stats: 'Stats',
    videos: 'Videos',
    customization: 'Customization',
  },
  defaultAvatar: '/default-avatar.png',
  adminpanelbutton: 'Admin Panel',
};

function MyChannelInner() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess, info: toastInfo } = useToast();

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editUsername, setEditUsername] = useState('');

  const editHandle = useMemo(() => (editUsername ? `@${editUsername.replace(/\s+/g, '')}` : ''), [editUsername]);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);

  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [existingThemes, setExistingThemes] = useState<string[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [showModal, setShowModal] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [initialFile, setInitialFile] = useState<File | null>(null);
  const [is_admin, setIs_admin] = useState(false);

  // === Utils ===
  const getSessionUser = useCallback(async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return null;
    return session.user;
  }, []);

  // === Fetchers ===
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    const user = await getSessionUser();
    if (!user) {
      toastError('Session expirée. Veuillez vous reconnecter.');
      setLoadingProfile(false);
      //router.push('/');
      return;
    }

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, is_admin')
      .eq('id', user.id)
      .single();

    if (error) {
      toastError('Impossible de charger le profil.');
      setLoadingProfile(false);
      return;
    }
    if (profileData.is_admin) {
      setIs_admin(true);
    }
    setProfile({ username: profileData.username, avatar_url: profileData.avatar_url });
    setEditUsername(profileData.username || '');
    setAvatarPreview(profileData.avatar_url);
    setLoadingProfile(false);
  }, [getSessionUser, router, toastError]);

  const fetchExistingThemes = useCallback(async () => {
    const { data, error } = await supabase.from('videos').select('themes');
    if (error) {
      toastInfo('Les suggestions de thèmes ne sont pas disponibles pour le moment.');
      return;
    }
    if (data) {
      const all = data.flatMap((v: { themes: unknown }) => {
        try {
          return parseThemes(v.themes as any);
        } catch {
          return [] as string[];
        }
      });
      const unique = Array.from(new Set(all));
      setExistingThemes(unique);
    }
  }, [toastInfo]);

  const fetchVideos = useCallback(async () => {
    setLoadingVideos(true);
    const user = await getSessionUser();
    if (!user) {
      setLoadingVideos(false);
      return;
    }

    const { data: vids, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toastError('Erreur lors du chargement des vidéos.');
      setLoadingVideos(false);
      return;
    }

    setVideos(vids || []);
    setLoadingVideos(false);
  }, [getSessionUser, toastError]);

  useEffect(() => {
    fetchProfile();
    fetchVideos();
    fetchExistingThemes();
  }, [fetchProfile, fetchVideos, fetchExistingThemes]);

  // === Dropzone ===
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    setInitialFile(acceptedFiles[0]);
    setEditingVideo(null);
    setShowModal(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false,
  });

  const openEditVideoModal = useCallback((video: Video) => {
    setEditingVideo(video);
    setInitialFile(null);
    setShowModal(true);
  }, []);

  // === Handlers ===
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/feed');
  }, [router]);

  const handleUsernameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEditUsername(e.target.value);
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!profile) return;
    setLoadingSave(true);
    const user = await getSessionUser();
    if (!user) {
      setLoadingSave(false);
      return;
    }

    const updates = { username: editUsername };
    const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', user.id);

    if (updateError) {
      toastError('Échec de la sauvegarde du profil.');
    } else {
      toastSuccess('Profil enregistré.');
      await fetchProfile();
    }

    setLoadingSave(false);
  }, [editUsername, fetchProfile, getSessionUser, profile, toastError, toastSuccess]);

  const handleAvatarChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarObjectUrlRef.current) URL.revokeObjectURL(avatarObjectUrlRef.current);

    const url = URL.createObjectURL(file);
    avatarObjectUrlRef.current = url;
    setAvatarPreview(url);

    // Upload avatar to Supabase storage and update profile
    const user = await getSessionUser();
    if (!user) {
      toastError('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
      upsert: true,
      cacheControl: '3600',
    });

    if (uploadError) {
      toastError('Erreur lors du téléchargement de la nouvelle image de profil.');
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = data?.publicUrl;

    if (publicUrl) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        toastError('Erreur lors de la mise à jour du profil.');
      } else {
        toastSuccess('Image de profil mise à jour.');
        setAvatarPreview(publicUrl);
        await fetchProfile();
      }
    }
  }, [getSessionUser, toastError, toastSuccess, fetchProfile]);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) URL.revokeObjectURL(avatarObjectUrlRef.current);
    };
  }, []);

  const handleDeleteVideo = useCallback(
    async (video: Video) => {
      if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) return;

      try {
        let pathToRemove: string | null = null;
        const storagePath = (video as any).storage_path as string | undefined;

        if (storagePath) {
          pathToRemove = storagePath;
        } else if (video.url) {
          const match = video.url.match(/\/videos\/(.+)$/);
          if (match?.[1]) pathToRemove = decodeURIComponent(match[1]);
        }

        if (pathToRemove) {
          const { error: storageError } = await supabase.storage.from('videos').remove([pathToRemove]);
          if (storageError) {
            console.warn('Erreur suppression fichier storage :', storageError);
            toastInfo("Le fichier n'a pas été trouvé dans le storage, suppression des métadonnées…");
          }
        } else {
          toastInfo("Chemin du fichier introuvable, suppression des métadonnées uniquement.");
        }

        const { error: dbError } = await supabase.from('videos').delete().eq('id', video.id);
        if (dbError) {
          toastError('Suppression en base échouée.');
          return;
        }

        await fetchVideos();
        toastSuccess('Vidéo supprimée.');
      } catch (err) {
        console.error('Erreur lors de la suppression :', err);
        toastError('Erreur lors de la suppression.');
      }
    },
    [fetchVideos, toastError, toastSuccess, toastInfo]
  );

  // === Render early exits ===
  if (loadingProfile) return <div className={`${styles.textCenter} ${styles.mt10}`}>{TEXT.loadingProfile}</div>;
  if (!profile) return <div className={`${styles.textCenter} ${styles.mt10}`}>{TEXT.unableToLoadProfile}</div>;

  return (
    <>
      <Topbar />
      <div className="page-wrapper container">
        <Sidebar active="channel" />
        <main className="main-content">
          <div className={styles.myChannelContainer}>
            <div className={styles.mainContent}>
              <div className={styles.channelCard}>
                <div className={styles.channelHeader}>
                  <img
                    src={avatarPreview || profile.avatar_url || TEXT.defaultAvatar}
                    alt={`${profile.username} avatar`}
                    width={140}
                    height={140}
                    style={{ borderRadius: '50%' }}
                  />
                  <div>
                    <h2>{profile.username}</h2>
                    <p>{editHandle}</p>
                    {is_admin && <div className={styles.adminBadge}>Administrateur</div>}
                  </div>
                </div>

                <div className={styles.tabsNav}>
                  <button
                    type="button"
                    className={activeTab === 'stats' ? styles.active : undefined}
                    onClick={() => setActiveTab('stats')}
                  >
                    {TEXT.tabs.stats}
                  </button>
                  <button
                    type="button"
                    className={activeTab === 'videos' ? styles.active : undefined}
                    onClick={() => setActiveTab('videos')}
                  >
                    {TEXT.tabs.videos}
                  </button>
                  <button
                    type="button"
                    className={activeTab === 'customization' ? styles.active : undefined}
                    onClick={() => setActiveTab('customization')}
                  >
                    {TEXT.tabs.customization}
                  </button>
                </div>

                {activeTab === 'videos' && (
                  <section>
                    <h3>{TEXT.manageVideos}</h3>
                    <div {...getRootProps({ className: styles.dropzone })}>
                      <input {...getInputProps()} />
                      {isDragActive ? <p>{TEXT.dropzoneActive}</p> : <p>{TEXT.dropzoneIdle}</p>}
                    </div>

                    {loadingVideos ? (
                      <p>{TEXT.loadingProfile.replace('profil', 'vidéos')}...</p>
                    ) : videos.length === 0 ? (
                      <p>{TEXT.noVideos}</p>
                    ) : (
                      <VideoList videos={videos} onEdit={openEditVideoModal} onDelete={handleDeleteVideo} />
                    )}
                  </section>
                )}

                {activeTab === 'customization' && (
                  <section>
                    <h3>{TEXT.customizeChannel}</h3>
                    <div className={styles.formGroup}>
                      <label>{TEXT.channelBanner}</label>
                      <div className={styles.bannerPreview}>
                        <img src="https://placehold.co/1200x250/557CD9/FFFFFF?text=Bannière" alt="Bannière de la chaîne" />
                        <button type="button">{TEXT.edit}</button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="avatar-upload">{TEXT.profileImage}</label>
                      <input id="avatar-upload" type="file" onChange={handleAvatarChange} />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="channel-name">{TEXT.channelName}</label>
                      <input id="channel-name" value={editUsername} onChange={handleUsernameChange} />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="channel-handle">{TEXT.channelHandle}</label>
                      <input id="channel-handle" value={editHandle} readOnly />
                    </div>

                    <div className={styles.actions}>
                      <button onClick={handleSaveProfile} disabled={loadingSave}>
                        {loadingSave ? TEXT.saving : TEXT.saveChanges}
                      </button>
                    </div>
                  </section>
                )}

                {activeTab === 'stats' && (
                  <section>
                    <h3>{TEXT.myChannelStats}</h3>
                    <div className={styles.statsGrid}>
                      <div className={styles.statCard}>
                        <p>{TEXT.totalViews}</p>
                        <p>--</p>
                      </div>
                      <div className={styles.statCard}>
                        <p>{TEXT.subscribers}</p>
                        <p>--</p>
                      </div>
                      <div className={styles.statCard}>
                        <p>{TEXT.publishedVideos}</p>
                        <p>{videos.length}</p>
                      </div>
                    </div>
                  </section>
                )}

                <div className={styles.actions}>
                  {is_admin && <button type="button" onClick={() => router.push("/adminpanel")}>{TEXT.adminpanelbutton}</button>}
                  <button type="button" onClick={handleLogout}>{TEXT.logout}</button>
                </div>
              </div>
            </div>

            {showModal && (
              <VideoUploadModal
                open={showModal}
                onClose={() => {
                  setShowModal(false);
                  setInitialFile(null);
                  setEditingVideo(null);
                }}
                onSuccess={fetchVideos}
                existingThemes={existingThemes}
                setExistingThemes={setExistingThemes}
                initialFile={initialFile}
                editingVideo={editingVideo}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default function MyChannelPage() {
  return (
    <ToastProvider>
      <MyChannelInner />
    </ToastProvider>
  );
}
