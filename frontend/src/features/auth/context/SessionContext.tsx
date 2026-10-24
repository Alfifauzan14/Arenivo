import * as React from "react";
import type { Profile } from "@futsal/shared";

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
  // Simpan status sesi di localStorage
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => {
    return (
      localStorage.getItem("futsal_logged_in") === "true" ||
      localStorage.getItem("futsal_auth_token") !== null
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

  const login = React.useCallback((_userData?: Partial<Profile>) => {
    setIsLoggedIn(true);
    localStorage.setItem("futsal_logged_in", "true");
    localStorage.setItem("futsal_auth_token", `tok_${Date.now()}`);
  }, []);

  const logout = React.useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem("futsal_logged_in");
    localStorage.removeItem("futsal_auth_token");
    localStorage.removeItem("futsal_mock_logged_in");
  }, []);

  const toggleSession = React.useCallback(() => {
    setIsLoggedIn((prev) => {
      const next = !prev;
      if (next) {
        localStorage.setItem("futsal_logged_in", "true");
      } else {
        localStorage.removeItem("futsal_logged_in");
        localStorage.removeItem("futsal_auth_token");
      }
      return next;
    });
  }, []);

  const toggleFavorite = React.useCallback((venueId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId];
      localStorage.setItem("futsal_favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = React.useCallback(
    (venueId: string) => favorites.includes(venueId),
    [favorites]
  );

  const user = isLoggedIn ? DEFAULT_USER : null;

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
