import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

type ProfileData = {
  username: string;
  avatar_url: string;
  email: string;
  created_at: string;
};

const TEXT = {
  loading: 'Chargement...',
  unableToLoad: 'Impossible de charger le profil.',
  tryAgain: 'Réessayer',
  myProfile: 'Mon profil',
  usernameLabel: 'Pseudo :',
  emailLabel: 'Email :',
  creationDateLabel: 'Date de création :',
  logout: 'Se déconnecter',
  defaultAvatar: '/default-avatar.png',
};

export default function Profile() {
  const [profile, setProfile] = useState<null | ProfileData>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      router.push('/');
      return;
    }

    const user = session.user;

    // get linked profile
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, created_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erreur récupération profil:', error);
      setLoading(false);
      return;
    }

    setProfile({
      username: profiles.username,
      avatar_url: profiles.avatar_url || TEXT.defaultAvatar,
      email: user.email || '',
      created_at: profiles.created_at,
    });
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/');
  }, [router]);

  if (loading) {
    return <div className="text-center mt-10">{TEXT.loading}</div>;
  }

  if (!profile) {
    return (
      <div className="text-center mt-10">
        <p>{TEXT.unableToLoad}</p>
        <button onClick={fetchProfile} className="mt-2 underline">
          {TEXT.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      <h1 className="text-3xl font-bold mb-6">{TEXT.myProfile}</h1>

      <img
        src={profile.avatar_url}
        alt="Photo de profil"
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border"
      />

      <div className="text-left bg-white shadow-md rounded-lg p-5">
        <p>
          <strong>{TEXT.usernameLabel}</strong> {profile.username}
        </p>
        <p>
          <strong>{TEXT.emailLabel}</strong> {profile.email}
        </p>
        <p>
          <strong>{TEXT.creationDateLabel}</strong>{' '}
          {new Date(profile.created_at).toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
      >
        {TEXT.logout}
      </button>
    </div>
  );
}
