import * as React from "react";
import type { Profile } from "@futsal/shared";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";

interface SessionContextType {
  user: Profile | null;
  isLoggedIn: boolean;
  authReady: boolean;
  login: (userData?: Partial<Profile>) => void;
  logout: () => Promise<void>;
  favorites: string[];
  toggleFavorite: (venueId: string) => void;
  isFavorite: (venueId: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [authReady, setAuthReady] = React.useState<boolean>(false);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const loadSeqRef = React.useRef(0);

  const loadUserProfile = React.useCallback(async (userId: string, userMeta?: any, email?: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      const savedName = localStorage.getItem(`futsal_name_${userId}`);
      const savedPhone = localStorage.getItem(`futsal_phone_${userId}`);
      const savedAvatar = localStorage.getItem(`futsal_avatar_${userId}`);

      if (profile) {
        setCurrentUser({
          id: profile.id,
          fullName: savedName || profile.full_name || userMeta?.full_name || "Pengguna Arenivo",
          email: profile.email || email || "",
          phone: savedPhone || profile.phone || userMeta?.phone || "",
          avatarUrl: savedAvatar || profile.avatar_url || userMeta?.avatar_url || userMeta?.picture || "",
          role: profile.role || "penyewa",
          status: profile.status || "aktif",
        });
        setIsLoggedIn(true);

        // Load favorites dari API dengan fallback Supabase langsung
        try {
          const favRes = await apiClient.get<any[]>("/me/favorites");
          if (favRes.data && Array.isArray(favRes.data)) {
            setFavorites(favRes.data.filter(Boolean).map((v: any) => v.id));
          }
        } catch {
          try {
            const { data: favRows } = await supabase
              .from("favorites")
              .select("venue_id")
              .eq("user_id", userId);
            if (favRows) {
              setFavorites(favRows.map((r: any) => r.venue_id));
            }
          } catch {
            // abaikan
          }
        }
        return;
      }
    } catch (err) {
      console.warn("Gagal memuat profil Supabase:", err);
    }

    // Fallback dari session metadata jika profil belum ter-insert
    const savedNameFallback = localStorage.getItem(`futsal_name_${userId}`);
    setCurrentUser({
      id: userId,
      fullName: savedNameFallback || userMeta?.full_name || email?.split("@")[0] || "Pengguna Arenivo",
      email: email || "",
      phone: userMeta?.phone || "",
      avatarUrl: userMeta?.avatar_url || userMeta?.picture || "",
      role: "penyewa",
      status: "aktif",
    });
    setIsLoggedIn(true);
  }, []);

  const refreshProfile = React.useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUserProfile(session.user.id, session.user.user_metadata, session.user.email);
    } else {
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  }, [loadUserProfile]);

  // Sinkronisasi Sesi Realtime Supabase Auth
  React.useEffect(() => {
    let active = true;
    const syncSession = async (session: any) => {
      const seq = ++loadSeqRef.current;
      if (session?.user) {
        localStorage.setItem("sb_access_token", session.access_token);
        localStorage.setItem("futsal_logged_in", "true");
        await loadUserProfile(session.user.id, session.user.user_metadata, session.user.email);
      } else {
        localStorage.removeItem("sb_access_token");
        localStorage.removeItem("futsal_logged_in");
        if (active && seq === loadSeqRef.current) {
          setCurrentUser(null);
          setIsLoggedIn(false);
          setFavorites([]);
        }
      }
      if (active && seq === loadSeqRef.current) {
        setAuthReady(true);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      void syncSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncSession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const login = React.useCallback((userData?: Partial<Profile>) => {
    if (userData) {
      setCurrentUser((prev) => {
        const updated = prev ? { ...prev, ...userData } : (userData as Profile);
        if (updated?.id) {
          if (userData.fullName) localStorage.setItem(`futsal_name_${updated.id}`, userData.fullName);
          if (userData.phone) localStorage.setItem(`futsal_phone_${updated.id}`, userData.phone);
          if (userData.avatarUrl) localStorage.setItem(`futsal_avatar_${updated.id}`, userData.avatarUrl);
        }
        return updated;
      });
      setIsLoggedIn(true);
    }
  }, []);

  const logout = React.useCallback(async () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("futsal_logged_in");
    localStorage.removeItem("futsal_auth_token");
    localStorage.removeItem("sb_access_token");
    localStorage.removeItem("futsal_mitra_authenticated");
    localStorage.removeItem("futsal_admin_authenticated");
    localStorage.removeItem("futsal_mitra_verification_status");
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
    window.location.href = "/";
  }, []);

  const toggleFavorite = React.useCallback(async (venueId: string) => {
    const isFav = favorites.includes(venueId);
    // Optimistic update
    setFavorites((prev) =>
      prev.includes(venueId) ? prev.filter((id) => id !== venueId) : [...prev, venueId]
    );

    try {
      if (isFav) {
        await apiClient.delete(`/me/favorites?venueId=${venueId}`);
      } else {
        await apiClient.put("/me/favorites", { venueId });
      }
    } catch {
      // Fallback langsung ke Supabase (RLS own_favorites mengizinkan user_id = auth.uid())
      try {
        const uid = currentUser?.id;
        if (!uid) throw new Error("Unauthenticated");
        if (isFav) {
          const { error } = await supabase.from("favorites").delete().eq("user_id", uid).eq("venue_id", venueId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("favorites").upsert({ user_id: uid, venue_id: venueId });
          if (error) throw error;
        }
      } catch {
        // Revert on error only if both API and Supabase failed
        setFavorites((prev) =>
          prev.includes(venueId) ? prev.filter((id) => id !== venueId) : [...prev, venueId]
        );
      }
    }
  }, [favorites, currentUser?.id]);

  const isFavorite = React.useCallback(
    (venueId: string) => favorites.includes(venueId),
    [favorites]
  );

  return (
    <SessionContext.Provider
      value={{
        user: currentUser,
        isLoggedIn,
        authReady,
        login,
        logout,
        favorites,
        toggleFavorite,
        isFavorite,
        refreshProfile,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
