import { useEffect, useState, useCallback, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import styles from './complete-profile.module.css'; // Import des styles

const TEXT = {
  title: 'Finalizing profile',
  completingSession: 'Recovering session...',
  sessionActive: 'Session active, complete your profile',
  sessionRetrieved: 'Session retrieved, complete your profile',
  noValidSession: "No valid session after token exchange.",
  needUsername: 'Username is required.',
  unexpectedError: 'Unexpected error:',
  unexpectedFinalError: 'Unexpected error during finalization:',
  profileErrorRls:
    "Profile error: new row violates security policy. Check that RLS policies allow the user to manage their own profile (auth.uid() = id).",
  finalizeButton: 'Finalize my profile',
  submitting: 'Submitting...',
  avatarOptional: 'Avatar (optional)',
  usernameLabel: 'Username',
  errorFallback:
    "If you confirmed your email, please refresh or log in again.",
};

type UserType = {
  id: string;
  email?: string | null;
  [key: string]: any;
};

export default function CompleteProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(TEXT.completingSession);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const applySession = async () => {
      try {
        const authCode = router.query.code as string | undefined;
        let data: any = null;
        let sessionError: any = null;

        if (authCode) {
          const res = await supabase.auth.exchangeCodeForSession(authCode);
          data = res.data;
          sessionError = res.error;
        }

        if (sessionError) {
          console.warn('Erreur getSessionFromUrl, fallback to existing session', sessionError);
          const {
            data: currentSession,
            error: currErr,
          } = await supabase.auth.getSession();
          if (currErr) {
            setError(`${TEXT.unexpectedError} ${currErr.message}`);
            return;
          }
          if (currentSession.session?.user) {
            setUser(currentSession.session.user);
            setStatus(TEXT.sessionActive);
          } else {
            setError("Aucune session détectée. Réessaie de te connecter.");
          }
        } else if (data?.session?.user) {
          setUser(data.session.user);
          setStatus(TEXT.sessionRetrieved);
        } else {
          const {
            data: currentSession,
            error: currErr,
          } = await supabase.auth.getSession();
          if (currErr) {
            setError(`${TEXT.unexpectedError} ${currErr.message}`);
            return;
          }
          if (currentSession.session?.user) {
            setUser(currentSession.session.user);
            setStatus(TEXT.sessionActive);
          } else {
            setError(TEXT.noValidSession);
          }
        }
      } catch (e: any) {
        setError(`${TEXT.unexpectedError} ${e.message}`);
      }
    };

    applySession();

    try {
      const pending = localStorage.getItem('pending_username');
      if (pending) setUsername(pending);
    } catch (e) {
      console.warn('Impossible de lire pending_username', e);
    }
  }, [router]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setIsSubmitting(true);
      setError('');

      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        setError(TEXT.needUsername);
        setIsSubmitting(false);
        return;
      }

      let avatar_url = '';

      try {
        if (avatarFile) {
          const safeExt =
            avatarFile.name
              .split('.')
              .pop()
              ?.replace(/[^a-zA-Z0-9]/g, '') || 'png';
          const fileName = `${user.id}.${safeExt}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile, { upsert: true });

          if (uploadError) {
            console.error('Erreur upload avatar:', uploadError);
            setError(`Erreur upload avatar: ${uploadError.message}`);
            setIsSubmitting(false);
            return;
          }

          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatar_url = (publicUrlData as any).publicUrl || '';
        }

        // Upsert profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              username: trimmedUsername,
              avatar_url,
            },
            { onConflict: 'id' }
          )
          .select()
          .single();

        if (profileError) {
          if (profileError.message.toLowerCase().includes('row-level security')) {
            setError(TEXT.profileErrorRls);
          } else {
            setError(`Erreur profil: ${profileError.message}`);
          }
          setIsSubmitting(false);
          return;
        }
        
        await supabase.auth.updateUser({
          data: { username: trimmedUsername, avatar_url },
        });

        router.push('/profile');
      } catch (e: any) {
        setError(`${TEXT.unexpectedFinalError} ${e.message}`);
        setIsSubmitting(false);
      }
    },
    [avatarFile, router, user, username]
  );

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.profileCard}>
          <h2 className={styles.title}>{TEXT.title}</h2>
          <p className={styles.error}>{error}</p>
          <p className={styles.statusMessage}>{TEXT.errorFallback}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.profileCard}>
          <h2 className={styles.title}>{TEXT.title}</h2>
          <p className={styles.statusMessage}>{status}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.profileCard}>
        <h2 className={styles.title}>{TEXT.title}</h2>
        <p className={styles.statusMessage}>{status}</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="username-input">
              {TEXT.usernameLabel}
            </label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}> {/* Ajout d'une marge pour l'input file */}
            <label htmlFor="avatar-upload">
              {TEXT.avatarOptional}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setAvatarFile(e.target.files[0]);
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? TEXT.submitting : TEXT.finalizeButton}
          </button>
        </form>
      </div>
    </div>
  );
}
