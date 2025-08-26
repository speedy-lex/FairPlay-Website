import { useState, useCallback, useEffect, FC, memo, } from "react";
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import {Topbar} from '@/components/ui/Topbar/Topbar';
import { Sidebar } from "@/components/ui/Sidebar/Sidebar";
import { parseThemes } from '@/lib/utils';
import React from 'react';
import { Video } from '@/types';

import { ToastProvider, useToast } from '@/components/ui/Toast/Toast';

export default function AdminPanel() {
    const router = useRouter();
    const { error: toastError, success: toastSuccess, info: toastInfo } = useToast();

    const [isAdmin, setIsAdmin] = useState(false);
    const [isloggedin, setIsloggedin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isLogInAutorised, setisLogInAutorised] = useState(false);
    const [isSigningInAutorised, setIsSigningInAutorised] = useState(true);
    const [is_uploading_enable, setisis_uploading_enable] = useState(true);
    const [videos, setVideos] = useState<any[]>([]);


    const fetchAdminStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setIsloggedin(true);
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();
            setIsAdmin(profile?.is_admin ?? false);
            console.log('isadmin',profile?.is_admin ?? false);
        }
    };
    function safeParseThemes(raw: unknown): string[] {
    try {
        return parseThemes(raw as any);
    } catch {
        return [];
    }
    }
    const ThemeTags: FC<{ themes: string[] }> = memo(({ themes }) => {
        if (!themes.length) return null;
        return (
            <div className={"tagList"}>
            {themes.map((t) => (
                <span key={t} className={"tagPill"}>
                {t}
                </span>
            ))}
            </div>
        );
        });
    const ActionButtons: FC<{
    video: Video;
    onAprove: (v: Video) => void;
    onRefuse: (v: Video) => void;
    }> = ({ video, onAprove, onRefuse }) => {
    const handleAprove = useCallback(() => onAprove(video), [onAprove, video]);
    const handleRefuse = useCallback(() => onRefuse(video), [onRefuse, video]);
    return (
        <div className={"actions"}>
        <button type="button" onClick={handleAprove}>
            {"aprove"}
        </button>
        <button type="button" onClick={handleRefuse}>
            {"refuse"}
        </button>
        </div>
    );
    };
    // Récupère la valeur du toggle
    const fetchFeatureEnabled = async (setting : string) => {
        const { data, error } = await supabase
        .from('settings')
        .select('bool_value')
        .eq('name', setting)
        .single();

        if (error) toastError(error.message);
        return(!!data?.bool_value);
    };

    const handleToggle = async (setting : string, actualValue:boolean) => {
        const newValue = !actualValue;

        

        const { error } = await supabase
            .from('settings')
            .update({ bool_value: newValue })
            .eq('name', setting);

        if (error) {
            toastError('Update failed: ' + error);
            return(!newValue);
        }
        else {return(newValue);}
    };
    const fetchVideos = useCallback(async () => {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            toastError('Error fetching videos: ' + error.message);
            return [];
        }
        return data;
    }, [toastError]);
const Thumbnail: FC<{ title: string; thumbnail?: string | null }> = memo(({ title, thumbnail }) => {
  const placeholder =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="100%" height="100%" fill="#F0F0F0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="100" fill="#666">No thumbnail</text></svg>`
    );
    useEffect(() => {
        const init = async () => {
            await fetchAdminStatus();
            if (isAdmin) {
                await setVideos(await fetchVideos());
                await setisis_uploading_enable(await fetchFeatureEnabled('is_uploading_enable'));
                await setisLogInAutorised(await fetchFeatureEnabled('isLogInAutorised'));
                await setIsSigningInAutorised(await fetchFeatureEnabled('isSigningInAutorised'));}
            setLoading(false);
        };
        init();
    }, []);

    if (loading) return (
        <>
            <Topbar />
            <div className="page-wrapper container">
                <Sidebar active="channel" />
                <main className="main-content">
                    <div style={{textAlign: "center"}}>Loading...</div>
                </main>
            </div>
        </>
    );

    return (
        <> 
            <Topbar />
            <div className="page-wrapper container">
            <Sidebar active="channel" />
            <main className="main-content">
            {isAdmin ? (
                <div>
                    Welcome to the Admin Panel
                   
                    
        
                    <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={is_uploading_enable}
                            onChange={async () => setisis_uploading_enable(await handleToggle('is_uploading_enable', is_uploading_enable))}
                        />
                        <span>Is uploading enabled</span>
                                            </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                        type="checkbox"
                        checked={isLogInAutorised}
                        onChange={async () => setisLogInAutorised(await handleToggle('isLogInAutorised', isLogInAutorised))}
                        />
                        <span>Is login authorized</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                        type="checkbox"
                        checked={isSigningInAutorised}
                        onChange={async () => setIsSigningInAutorised(await handleToggle('isSigningInAutorised', isSigningInAutorised))}
                        />
                        <span>Is sign-in authorized</span>
                    </label>
                    </div>

                    

                    </div>
                </div>
            ) : (
                <>
                  <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 4px 24px rgba(106,142,251,0.08)',
                        padding: '2rem 2.5rem',
                        marginTop: 40,
                        maxWidth: 400,
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}>
                        {/* Illustration SVG */}
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ marginBottom: 24 }}>
                        <circle cx="40" cy="40" r="40" fill="#F3F6FF"/>
                        <path d="M40 24C34.4772 24 30 28.4772 30 34C30 39.5228 34.4772 44 40 44C45.5228 44 50 39.5228 50 34C50 28.4772 45.5228 24 40 24ZM40 41C36.6863 41 34 38.3137 34 35C34 31.6863 36.6863 29 40 29C43.3137 29 46 31.6863 46 35C46 38.3137 43.3137 41 40 41Z" fill="#6A8EFB"/>
                        <rect x="24" y="50" width="32" height="6" rx="3" fill="#E1E8FF"/>
                        <rect x="32" y="56" width="16" height="6" rx="3" fill="#E1E8FF"/>
                        </svg>
                        <div style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        color: '#6A8EFB',
                        marginBottom: 12,
                        textAlign: 'center'
                        }}>
                        You do not have access to this page.
                        </div>
                        {!isloggedin && (
                        <Link
                            href="/login?redirect=/adminpanel"
                            className="login-button"
                            style={{
                            marginTop: 16,
                            background: '#6A8EFB',
                            color: '#fff',
                            padding: '0.7rem 2rem',
                            borderRadius: 999,
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontFamily: "'Montserrat', sans-serif",
                            boxShadow: '0 2px 8px rgba(106,142,251,0.12)',
                            transition: 'background 0.2s'
                            }}
                        >
                            Login
                        </Link>
                        )}
                    </div>
                </>
            )}
            </main>
            </div>
               </>
    );
})}
