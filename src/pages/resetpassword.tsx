import React, { useState, useCallback, FormEvent, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Topbar } from '@/components/ui/Topbar/Topbar';
import styles from './login.module.css';
import { type EmailOtpType } from '@supabase/supabase-js'

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
  const { token_hash, type, next } = router.query as {
    token_hash?: string;
    type?: EmailOtpType;
    next?: string;
  };

  // You may want to handle the verification in a useEffect if needed
  // Example:
  // useEffect(() => {
  //   const verify = async () => {
  //     if (token_hash && type) {
  //       const { error } = await supabase.auth.verifyOtp({
  //         type,
  //         token_hash,
  //       });
  //       if (!error) {
  //         router.replace(next ?? '/reset-password');
  //       }
  //     }
  //   };
  //   verify();
  // }, [token_hash, type, next, router]);

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [Error, setRegisterError] = useState('');
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
      setRegisterError('');
      setRegisterMessage('');

      if (registerPassword !== registerConfirmPassword) {
        setRegisterError(TEXT.passwordMismatch);
        return;
      }

      setRegisterLoading(true);
      try {
        localStorage.setItem('pending_username', registerUsername.trim());

        const { error } = await supabase.auth.updateUser({password: registerPassword});
            

        if (error) {
          setRegisterError(error.message);
          return;
        }

      } catch {
        setRegisterError("Une erreur est survenue lors de l'inscription.");
      } finally {
        setRegisterLoading(false);
      }
    },
    [registerEmail, registerPassword, registerConfirmPassword, registerUsername, registerLoading]
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
                {Error && <p className={styles.error}>{Error}</p>}
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
