import { useState, useCallback, useEffect } from "react";
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Link from "next/link";

export default function AdminPanel() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isloggedin, setIsloggedin] = useState(false);
    const [is_uploading_enable, setisuploadingenable] = useState(false);

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
        }
    };

    // Récupère la valeur du toggle
    const fetchFeatureEnabled = async () => {
        const { data, error } = await supabase
        .from('settings')
        .select('bool_value')
        .eq('name', 'is_uploading_enable')
        .single();

        if (error) console.error(error);
        setisuploadingenable(!!data?.bool_value);
    };

    const handleToggle = async () => {
    const newValue = !is_uploading_enable;

    setisuploadingenable(newValue);

    const { error } = await supabase
        .from('settings')
        .update({ bool_value: newValue })
        .eq('name', 'is_uploading_enable');

    if (error) {
        console.error('Update failed:', error);
        setisuploadingenable(!newValue);
    }
    };

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        router.push('/feed');
    }, [router]);

    useEffect(() => {
        fetchAdminStatus();
        fetchFeatureEnabled();
    }, []);

    return (
        <>
            {isAdmin ? (
                <div>
                    Welcome to the Admin Panel
                    <br />
                    <button onClick={handleLogout}>Logout</button>
        
                    <div style={{ marginTop: 20 }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={is_uploading_enable}
                                onChange={handleToggle}
                            />
                            &nbsp; is uploading enable
                        </label>
                        <button onClick={fetchFeatureEnabled} style={{ marginLeft: 10 }}>
                            Refresh 
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div>You do not have access to this page.</div>
                    {!isloggedin && (<Link href="/login?redirect=/adminpanel" className="login-button">Login</Link>)}
                </>
            )}
            
        </>
    );
}
