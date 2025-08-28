import { useState, useCallback, useEffect, FC, memo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Topbar } from "@/components/ui/Topbar/Topbar";
import { Sidebar } from "@/components/ui/Sidebar/Sidebar";
import { ToastProvider, useToast } from "@/components/ui/Toast/Toast";
import styles from './adminpanel.module.css';
import VideoList from "@/components/mychannel/VideoList";
import { Video } from "@/types";

export default function AdminPanel() {
  const { error: toastError } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isloggedin, setIsloggedin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isLogInAutorised, setisLogInAutorised] = useState(false);
  const [isSigningInAutorised, setIsSigningInAutorised] = useState(true);
  const [is_uploading_enable, setisis_uploading_enable] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [userId, setuser] = useState("");

  const fetchAdminStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setIsloggedin(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.is_admin ?? false);
      //setuser(user?.id);
    }
  }, []);

  const fetchFeatureEnabled = useCallback(async (setting: string) => {
    const { data, error } = await supabase
      .from("settings")
      .select("bool_value")
      .eq("name", setting)
      .single();
    if (error) toastError?.(error.message);
    return !!data?.bool_value;
  }, [toastError]);

  const handleToggle = useCallback(async (setting: string, actualValue: boolean) => {
    const newValue = !actualValue;
    const { error } = await supabase
      .from("settings")
      .update({ bool_value: newValue })
      .eq("name", setting);
    if (error) {
      toastError?.("Update failed: " + error.message);
      return actualValue;
    }
    return newValue;
  }, [toastError]);

  const fetchVideos = useCallback(async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("is_verified", false)
      .eq("is_refused", false)
      .order("created_at", { ascending: true });
    if (error) {
      toastError?.("Error fetching videos: " + error.message);
      return [];
    }
    return data || [];
  }, [toastError]);

  const fetchusersession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (user?.id) {
      setuser(user.id);
      console.log("user", user.id);
    } else {
      toastError("User ID is undefined");
    }
  }, [supabase.auth]);

  useEffect(() => {
    (async () => {
      await fetchAdminStatus();
      if (isAdmin) {
        await fetchusersession();
        setVideos(await fetchVideos());
        setisis_uploading_enable(await fetchFeatureEnabled("is_uploading_enable"));
        setisLogInAutorised(await fetchFeatureEnabled("isLogInAutorised"));
        setIsSigningInAutorised(await fetchFeatureEnabled("isSigningInAutorised"));
      }
      setLoading(false);
    })();
  }, [isAdmin, fetchAdminStatus, fetchVideos, fetchFeatureEnabled]);

 const updateVideo = useCallback(async (video: Video) => {
    const { error } = await supabase 
      .from("videos")
      .update({
        is_verified: video.is_verified,
        is_refused: video.is_refused,
        verifiedOnce: video.verifiedOnce,
        refusedOnce: video.refusedOnce,
        verifiedOnce_user_id: video.verifiedOnce_user_id,
        refusedOnce_user_id: video.refusedOnce_user_id,
      })
      .eq("id", video.id);
    if (error) {
      toastError?.("Error updating video: " + error.message);
      return;
    }

  }, [toastError]);

  const handleAprove = useCallback(async (video: Video) => {
    if (userId === video.refusedOnce_user_id) {
      video.refusedOnce_user_id = null;
      video.refusedOnce = false;
    }
    if (!video.verifiedOnce) {
      video.verifiedOnce = true;
      video.verifiedOnce_user_id = userId

    }
    if (video.verifiedOnce && !video.is_refused && userId !== video.verifiedOnce_user_id) {
      video.is_verified = true;
    }
    console.log(video);
    console.log("userid", userId);
    await updateVideo(video);
  }, []);

  const handleRefuse = useCallback(async (video: Video) => {
    if (userId === video.verifiedOnce_user_id) {
      video.verifiedOnce_user_id = null;
      video.verifiedOnce = false;
    }
    if (!video.refusedOnce) {
      video.refusedOnce = true;
      video.refusedOnce_user_id = userId
  } 
    if (video.refusedOnce && !video.verifiedOnce && userId !== video.refusedOnce_user_id) {
      video.is_refused = true;
    }
    if (video.refusedOnce && video.verifiedOnce && userId !== video.refusedOnce_user_id && userId !== video.verifiedOnce_user_id) {
      video.is_refused = true;
    }
    await updateVideo(video);

}, []);

  if (loading) {
    return (
      <ToastProvider>
        <Topbar />
        <div className="page-wrapper container">
          <Sidebar active="channel" />
          <main className="main-content">
            <div style={{ textAlign: "center" }}>Loading...</div>
          </main>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Topbar />
      <div className="page-wrapper container">
        <Sidebar active="channel" />
        <main className="main-content">
          {isAdmin ? (
            <div>
              <h1 className={styles.settingsTitle}>Welcome to the Admin Panel</h1>
              <div className={styles.settingsContainer}>
                  <label className={styles.settingsLabel}>
                    <input
                      type="checkbox"
                      checked={is_uploading_enable}
                      onChange={async () =>
                        setisis_uploading_enable(await handleToggle("is_uploading_enable", is_uploading_enable))
                      }
                    />
                    <span>Is uploading enabled</span>
                  </label>

                  <label className={styles.settingsLabel}>
                    <input
                      type="checkbox"
                      checked={isLogInAutorised}
                      onChange={async () =>
                        setisLogInAutorised(await handleToggle("isLogInAutorised", isLogInAutorised))
                      }
                    />
                    <span>Is login authorized</span>
                  </label>

                  <label className={styles.settingsLabel}>
                    <input
                      type="checkbox"
                      checked={isSigningInAutorised}
                      onChange={async () =>
                        setIsSigningInAutorised(await handleToggle("isSigningInAutorised", isSigningInAutorised))
                      }
                    />
                    <span>Is sign-in authorized</span>
                  </label>
                </div>
                <div className={"mainContente"} style={{marginTop: 40}}>
                  <VideoList videos={videos} onButton1={handleAprove} onButton2={handleRefuse} button1Text="✅ Aprove" button2Text="❌ Refuse" />
                        </div>
              </div>
            
          ) : (
            <div className={styles.errorContainer}>
              <div className={styles.errorTitle}>You do not have access to this page.</div>
              {!isloggedin && (
                <Link href="/login?redirect=/adminpanel" className={styles.loginButton}>Login</Link>
              )}
            </div>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}



