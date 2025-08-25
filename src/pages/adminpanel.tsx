import { useState, useCallback, useEffect } from "react";
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Topbar } from "@/components/Topbar";
import { Sidebar } from "@/components/Sidebar";
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
        const { data } = await supabase
            .from('settings')
            .upsert({ name : "ee" ,bool_value: false })
            /*.select('bool_value')
            .eq('name', 'is_uploading_enable')
            .single();*/;
        //setisuploadingenable(!!data?.bool_value); // force booléen
    };

    // Met à jour la valeur du toggle et relit la valeur depuis la base
    const handleToggle = async () => {
        let newValue = !is_uploading_enable;
        newValue=true
        const { error, data } = await supabase
            .from('settings')
            .update({ bool_value: newValue })
            .eq('name', 'is_uploading_enable');
    
            fetchFeatureEnabled();
            console.log("Toggle updated:", error);
            console.log("New value:", newValue);
        
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
                        <button onClick={handleToggle} style={{ marginLeft: 10 }}>
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
