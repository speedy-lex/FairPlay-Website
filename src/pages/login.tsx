import React, { useState, useCallback, FormEvent, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Topbar } from '@/components/Topbar';

const TEXT = {
  title: 'Authentification',
  loginTab: 'Connexion',
  registerTab: "Inscription",
  email: 'Email',
  password: 'Mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  username: 'Pseudo',
  loginButton: 'Se connecter',
  registerButton: "S'inscrire",
  passwordMismatch: 'Les mots de passe ne correspondent pas.',
  usernameRequired: 'Le pseudo est requis.',
  confirmationSent:
    'Un email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.',
  authTitle: 'Auth',
};

type Tab = 'login' | 'register';

export default function Auth() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('login');

  // login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Clean errors when changing tabs
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
          await router.push('/');
        }
      } catch (err) {
        setLoginError('Une erreur est survenue lors de la connexion.');
        console.error('Login error:', err);
      } finally {
        setLoginLoading(false);
      }
    },
    [loginEmail, loginPassword, loginLoading, router]
  );

  const handleRegister = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (registerLoading) return;
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
        // save pseudo
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            localStorage.setItem(
              'pending_username',
              registerUsername.trim()
            );
          } catch (storageErr) {
            console.warn(
              'Impossible de sauvegarder le pseudo en localStorage',
              storageErr
            );
          }
        }

        const redirectUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}/complete-profile`
            : '/complete-profile';

        const { error } = await supabase.auth.signUp({
          email: registerEmail,
          password: registerPassword,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          setRegisterError(error.message);
          return;
        }

        setRegisterMessage(TEXT.confirmationSent);
      } catch (err) {
        setRegisterError(
          "Une erreur est survenue lors de l'inscription."
        );
        console.error('Register error:', err);
      } finally {
        setRegisterLoading(false);
      }
    },
    [
      registerEmail,
      registerPassword,
      registerConfirmPassword,
      registerUsername,
      registerLoading,
    ]
  );

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace('/');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div>
      <Topbar />
      <Head>
        <title>{TEXT.authTitle}</title>
      </Head>

      <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            aria-pressed={activeTab === 'login'}
            className={`focus:outline-none ${
              activeTab === 'login' ? 'font-bold' : ''
            }`}
            onClick={() => {
              setActiveTab('login');
              resetErrors();
            }}
          >
            {TEXT.loginTab}
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'register'}
            className={`focus:outline-none ${
              activeTab === 'register' ? 'font-bold' : ''
            }`}
            onClick={() => {
              setActiveTab('register');
              resetErrors();
            }}
          >
            {TEXT.registerTab}
          </button>
        </div>

        {activeTab === 'login' && (
          <form onSubmit={handleLogin} aria-label="Formulaire de connexion">
            <div className="mb-2">
              <label htmlFor="login-email" className="block">
                {TEXT.email}
              </label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full border p-2 rounded"
                aria-describedby="login-error"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="login-password" className="block">
                {TEXT.password}
              </label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full border p-2 rounded"
                aria-describedby="login-error"
              />
            </div>
            {loginError && (
              <p
                id="login-error"
                className="text-red-500"
                role="alert"
                aria-live="assertive"
              >
                {loginError}
              </p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loginLoading ? '…' : TEXT.loginButton}
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form
            onSubmit={handleRegister}
            aria-label="Formulaire d'inscription"
          >
            <div className="mb-2">
              <label htmlFor="register-username" className="block">
                {TEXT.username}
              </label>
              <input
                id="register-username"
                type="text"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                required
                className="w-full border p-2 rounded"
                aria-describedby="register-error register-message"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="register-email" className="block">
                {TEXT.email}
              </label>
              <input
                id="register-email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                className="w-full border p-2 rounded"
                aria-describedby="register-error register-message"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="register-password" className="block">
                {TEXT.password}
              </label>
              <input
                id="register-password"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                className="w-full border p-2 rounded"
                aria-describedby="register-error register-message"
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor="register-confirm-password"
                className="block"
              >
                {TEXT.confirmPassword}
              </label>
              <input
                id="register-confirm-password"
                type="password"
                value={registerConfirmPassword}
                onChange={(e) =>
                  setRegisterConfirmPassword(e.target.value)
                }
                required
                className="w-full border p-2 rounded"
                aria-describedby="register-error register-message"
              />
            </div>
            {registerError && (
              <p
                id="register-error"
                className="text-red-500"
                role="alert"
                aria-live="assertive"
              >
                {registerError}
              </p>
            )}
            {registerMessage && (
              <p
                id="register-message"
                className="text-green-600"
                role="status"
                aria-live="polite"
              >
                {registerMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={registerLoading}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {registerLoading ? '…' : TEXT.registerButton}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
