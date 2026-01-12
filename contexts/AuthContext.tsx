"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
type Tenant = {
  id: number;
  phone: string | null;
};

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  plan_id: number;                    
  subscription_status: string;        
  current_period_end: string | null; 
  is_owner: boolean;                   
  has_valid_subscription: boolean; 
  last_plan_id: number;
  stripe_id: string | null;
  tenant: Tenant;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>; 
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = Cookies.get("auth_token");
    const storedUser = Cookies.get("auth_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (token: string, user: any) => {
    setToken(token);
    setUser(user);
    Cookies.set("auth_token", token, { expires: 7, secure: true, sameSite: "Lax" });
    Cookies.set("auth_user", JSON.stringify(user), { expires: 7, secure: true, sameSite: "Lax" });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    Cookies.remove("auth_token");
    Cookies.remove("auth_user");
    window.location.href = "/signin"; 
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, {  
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to refresh user");
      const updatedUser = await res.json();
      setUser(updatedUser);
      Cookies.set("auth_user", JSON.stringify(updatedUser), { expires: 7, secure: true, sameSite: "Lax" });
    } catch (err) {
      console.error("Refresh user failed", err);
      logout();  
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}