import React, { useState, useCallback, FormEvent, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Topbar } from '@/components/ui/Topbar/Topbar';
import styles from './login.module.css';
import Link from 'next/link';
import { redirect } from 'next/dist/server/api-utils';

const TEXT = {
  title: 'Authentification',
  loginTab: 'Login',
  registerTab: 'Signup',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  username: 'Username',
  loginButton: 'Login',
  registerButton: 'Signup',
  passwordMismatch: 'Passwords do not match.',
  usernameRequired: 'Username is required.',
  confirmationSent:
    'A confirmation email has been sent. Please check your inbox.',
  pageTitle: 'Login - FairPlay',
  loginWithoutPassword: 'Login without Password',
  logindisabled: 'Login is currently disabled.',
  registerdisabled: 'Registration is currently disabled.',
  loginerror: 'An error occurred during login.',
  registerError: 'An error occurred during registration.',
  enterEmail: 'Please enter a valid email address.',
  enterPassword: 'Please enter your password.',
  emailSendedLoginWithoutPassword: 'A login email has been sent to your address.',
  emailSenededLoginWithoutPasswordError: 'A login email has been sent to your address.',
  welcome : 'Welcome !',
  welcomeMessage : 'Access high-quality videos',
};

type Tab = 'login' | 'register';

export default function Auth() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginInfo, setLoginInfo] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/feed');
  const [isLogInAutorised, setisLogInAutorised] = useState(false);
  const [isSigningInAutorised, setIsSigningInAutorised] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const resetErrors = useCallback(() => {
    setLoginError('');
    setRegisterError('');
    setRegisterMessage('');
  }, []);

  const handleLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (loginLoading) return;
      setLoginError('');
      setLoginLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });
        if (error) {
          setLoginError(error.message);
        } else {
          await router.push(redirectTo);
        }
      } catch {
        setLoginError(TEXT.loginerror);
      } finally {
        setLoginLoading(false);
      }
    },
    [loginEmail, loginPassword, loginLoading, router]
  );

  const handleRegister = useCallback(
    async (e: FormEvent) => {
      resetErrors();
      e.preventDefault();
      if (registerLoading) return;
      if (!isSigningInAutorised) {
        setRegisterError(TEXT.registerdisabled);
        return;
      }
      setRegisterError('');
      setRegisterMessage('');

      if (registerPassword !== registerConfirmPassword) {
        setRegisterError(TEXT.passwordMismatch);
        return;
      }
      if (!registerUsername.trim()) {
        setRegisterError(TEXT.usernameRequired);
        return;
      }

      setRegisterLoading(true);
      try {
        localStorage.setItem('pending_username', registerUsername.trim());

        const redirectUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}/complete-profile`
            : '/complete-profile';

        const { error } = await supabase.auth.signUp({
          email: registerEmail,
          password: registerPassword,
          options: { emailRedirectTo: redirectUrl },
        });

        if (error) {
          setRegisterError(error.message);
          return;
        }

        setRegisterMessage(TEXT.confirmationSent);
      } catch {
        setRegisterError("Une erreur est survenue lors de l'inscription.");
      } finally {
        setRegisterLoading(false);
      }
    },
    [registerEmail, registerPassword, registerConfirmPassword, registerUsername, registerLoading]
  );

  const handleForgotPassword = useCallback(async () => {
    resetErrors();
    if (!loginEmail) {  
      setLoginError('Please enter your email.');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: loginEmail,
        options: { emailRedirectTo: 'https://fairplay.video/?loginwithoutpassword=true' }
      });
      if (error) {
        setLoginError(error.message);
      } else {
        setLoginInfo('A password reset email has been sent.');
      }
    } catch (err) {
      setLoginError('An error occurred while sending the reset email.');
    }
  }, [loginEmail]);

  const fetchSettingEnabled = async (setting : string) => {
    const { data, error } = await supabase
    .from('settings')
    .select('bool_value')
    .eq('name', setting)
    .single();

    if (error) console.error(error.message);
    return(!!data?.bool_value);
    };

  const init = async () => {
    setisLogInAutorised(await fetchSettingEnabled('isLogInAutorised'));
    setIsSigningInAutorised(await fetchSettingEnabled('isSigningInAutorised'));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/');
    });
    const params = new URLSearchParams(window.location.search);
    const redirect= params.get('redirect');
    init();
    if (redirect) {
      setRedirectTo(redirect);
    }
  }, [router]);

  return (
    <div className={styles.page}>
      <Topbar />
      <Head>
        <title>{TEXT.pageTitle}</title>
      </Head>
      <section className={styles.auth}>
        <div className={styles.left}>
          <h1 className={styles.title}>{TEXT.title}</h1>

          <div className={styles.tabs}>
            {(['login', 'register'] as Tab[]).map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  resetErrors();
                }}
              >
                {tab === 'login' ? TEXT.loginTab : TEXT.registerTab}
              </button>
            ))}
          </div>

          <div className={styles.formContainer}>
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className={styles.form}>
                <label>
                  {TEXT.email}
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </label>
                <label>
                  {TEXT.password}
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </label>
                <span className='loginWithoutPasswordButton' onClick={handleForgotPassword}>{TEXT.loginWithoutPassword}</span>
                {loginInfo && <p className={styles.info}>{loginInfo}</p>}
                {loginError && <p className={styles.error}>{loginError}</p>}
                <button type="submit" disabled={loginLoading}>
                  {loginLoading ? '…' : TEXT.loginButton}
                </button>
              </form>
            )}

            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className={styles.form}>
                <label>
                  {TEXT.username}
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                  />
                </label>
                <label>
                  {TEXT.email}
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </label>
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
                  {registerLoading ? '…' : TEXT.registerButton}
                </button>
              </form>
            )}
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
