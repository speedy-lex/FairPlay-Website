import React, { useState, useCallback, FormEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Topbar } from '@/components/ui/Topbar/Topbar';
import styles from './login.module.css';

const TEXT = {
  title: 'Authentification',
  password: 'New Password',
  confirmPassword: 'Confirm Password',
  saveButton: 'Save',
  passwordMismatch: 'Passwords do not match.',

  pageTitle: 'Reset Password- FairPlay',
};


export default function Auth() {
  
  const router = useRouter();
  
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  const resetErrors = useCallback(() => {
    setRegisterError('');
    setRegisterMessage('');
  }, []);

  const handleRegister = useCallback(
    async (e: FormEvent) => {
      resetErrors();
      e.preventDefault();
      if (registerLoading) return;
      resetErrors();

      if (registerPassword !== registerConfirmPassword) {
        setRegisterError(TEXT.passwordMismatch);
        return;
      }

      setRegisterLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({ password: registerPassword });

        if (error) {
          setRegisterError(error.message);
          return;
        }

        router.push('/login');
      } catch {
        setRegisterError("An error occurred while resetting your password.");
      } finally {
        setRegisterLoading(false);
      }
    },
    [registerPassword, registerConfirmPassword, resetErrors, router, registerLoading]
  );
/*
  useEffect(() => {
    const verify = async () => {
      if (token_hash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token: token_hash,
        });
        if (error) setRegisterError(error.message);
      }
    };
    verify();
  }, [token_hash, type]);
*/
  return (
    <div className={styles.page}>
      <Topbar />
      <Head>
        <title>{TEXT.pageTitle}</title>
      </Head>
      <section className={styles.auth}>
        <div className={styles.left}>
          <h1 className={styles.title}>{TEXT.title}</h1>

          <div className={styles.formContainer}>
              <form onSubmit={handleRegister} className={styles.form}>
                <label>
                  {TEXT.password}
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </label>
                <label>
                  {TEXT.confirmPassword}
                  <input
                    type="password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    required
                  />
                </label>
                {registerError && <p className={styles.error}>{registerError}</p>}
                {registerMessage && <p className={styles.success}>{registerMessage}</p>}
                <button type="submit" disabled={registerLoading}>
                  {registerLoading ? '…' : TEXT.saveButton}
                </button>
              </form>
          </div>
        </div>
        <aside className={styles.right} aria-hidden="true">
          <div className={styles.illustration}>
            <h2>Welcome !</h2>
            <p>Access high-quality videos</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
