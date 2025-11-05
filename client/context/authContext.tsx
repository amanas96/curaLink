"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";

// --- Interfaces ---
interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

// --- Context Creation ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Load Token from LocalStorage on Start ---
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // --- Fetch User if Token Exists ---
  useEffect(() => {
    if (!token) return;

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const fetchUser = async () => {
      try {
        const res = await api.get("/patient/me");
        setUser(res.data);
      } catch {
        try {
          const res = await api.get("/researcher/me");
          setUser(res.data);
        } catch (err) {
          console.error("❌ Failed to verify token, logging out", err);
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
          delete api.defaults.headers.common["Authorization"];
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // --- ✅ FIXED login function ---
  const login = async (newToken: string) => {
    setLoading(true); // <--- Added this line
    localStorage.setItem("authToken", newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);

    try {
      // Immediately fetch the user after login
      const res = await api.get("/patient/me").catch(async () => {
        return await api.get("/researcher/me");
      });

      setUser(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch user after login", err);
      localStorage.removeItem("authToken");
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false); // <--- and here
    }
  };

  // --- Logout ---
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  // --- Show Loader While Initializing Auth ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading CuraLink...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Hook ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
