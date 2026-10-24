import * as React from "react";
import type { Profile } from "@futsal/shared";
import { supabase } from "@/lib/supabase";

interface SessionContextType {
  user: Profile | null;
  isLoggedIn: boolean;
  login: (userData?: Partial<Profile>) => void;
  logout: () => void;
  toggleSession: () => void;
  favorites: string[];
  toggleFavorite: (venueId: string) => void;
  isFavorite: (venueId: string) => boolean;
}

const DEFAULT_USER: Profile = {
  id: "usr-1",
  fullName: "Rizky Ramadhan",
  email: "rizky.ramadhan@gmail.com",
  phone: "081234567890",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
  role: "penyewa",
  status: "aktif",
};

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => {
    return (
      localStorage.getItem("futsal_logged_in") === "true" ||
      localStorage.getItem("futsal_auth_token") !== null ||
      localStorage.getItem("sb_access_token") !== null
    );
  });

  const [favorites, setFavorites] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("futsal_favorites");
      return saved ? JSON.parse(saved) : ["v1111111-1111-1111-1111-111111111111"];
    } catch {
      return ["v1111111-1111-1111-1111-111111111111"];
    }
  });

  // Sinkronisasi Sesi Supabase Auth (Termasuk Google OAuth)
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        localStorage.setItem("sb_access_token", session.access_token);
        localStorage.setItem("futsal_logged_in", "true");
        setCurrentUser({
          id: session.user.id,
          fullName:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "Pengguna Arenivo",
          email: session.user.email || "",
          phone: session.user.phone || session.user.user_metadata?.phone || "081234567890",
          avatarUrl:
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture ||
            DEFAULT_USER.avatarUrl,
          role: "penyewa",
          status: "aktif",
        });
      } else if (localStorage.getItem("futsal_logged_in") === "true") {
        setIsLoggedIn(true);
        setCurrentUser(DEFAULT_USER);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        localStorage.setItem("sb_access_token", session.access_token);
        localStorage.setItem("futsal_logged_in", "true");
        setCurrentUser({
          id: session.user.id,
          fullName:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "Pengguna Arenivo",
          email: session.user.email || "",
          phone: session.user.phone || session.user.user_metadata?.phone || "081234567890",
          avatarUrl:
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture ||
            DEFAULT_USER.avatarUrl,
          role: "penyewa",
          status: "aktif",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = React.useCallback((userData?: Partial<Profile>) => {
    setIsLoggedIn(true);
    localStorage.setItem("futsal_logged_in", "true");
    localStorage.setItem("futsal_auth_token", `tok_${Date.now()}`);
    if (userData) {
      setCurrentUser((prev) => ({
        ...(prev || DEFAULT_USER),
        ...userData,
      }));
    } else {
      setCurrentUser(DEFAULT_USER);
    }
  }, []);

  const logout = React.useCallback(async () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("futsal_logged_in");
    localStorage.removeItem("futsal_auth_token");
    localStorage.removeItem("sb_access_token");
    localStorage.removeItem("futsal_mock_logged_in");
    await supabase.auth.signOut().catch(() => {});
  }, []);

  const toggleSession = React.useCallback(() => {
    setIsLoggedIn((prev) => {
      const next = !prev;
      if (next) {
        localStorage.setItem("futsal_logged_in", "true");
        setCurrentUser(DEFAULT_USER);
      } else {
        localStorage.removeItem("futsal_logged_in");
        localStorage.removeItem("futsal_auth_token");
        localStorage.removeItem("sb_access_token");
        setCurrentUser(null);
      }
      return next;
    });
  }, []);

  const toggleFavorite = React.useCallback((venueId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId];
      try {
        localStorage.setItem("futsal_favorites", JSON.stringify(next));
      } catch (e) {
        console.error("Gagal menyimpan favorit:", e);
      }
      return next;
    });
  }, []);

  const isFavorite = React.useCallback(
    (venueId: string) => favorites.includes(venueId),
    [favorites]
  );

  const user = currentUser || (isLoggedIn ? DEFAULT_USER : null);

  return (
    <SessionContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        logout,
        toggleSession,
        favorites,
        toggleFavorite,
        isFavorite,
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
