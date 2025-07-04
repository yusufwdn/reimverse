"use client";

import Cookies from 'js-cookie';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  role: "employee" | "manager" | "admin";
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token in localStorage
    // const storedToken = localStorage.getItem("auth_token");
    // const storedUser = localStorage.getItem("auth_user");

    // Check if we have a token in cookies
    const storedToken = Cookies.get("auth_token")
    const storedUser = Cookies.get("auth_user")

    console.log("Checking stored auth:", { storedToken, storedUser }); // Debug log

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse auth data from localStorage", error);
        // localStorage.removeItem("auth_token");
        // localStorage.removeItem("auth_user");
        Cookies.remove("auth_token");
        Cookies.remove("auth_user");
      } finally { }
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    console.log("Login function called with:", { newToken, newUser }) // Debug log

    setToken(newToken);
    setUser(newUser);
    
    // localStorage.setItem("auth_token", newToken);
    // localStorage.setItem("auth_user", JSON.stringify(newUser));

    // set cookies for 7 days
    Cookies.set("auth_token", newToken, { expires: 7 });
    Cookies.set("auth_user", JSON.stringify(newUser), { expires: 7 });

    console.log("User and token set in context") // Debug log
  };

  const logout = () => {
    console.log("Logout function called") // Debug log
    setToken(null);
    setUser(null);

    // localStorage.removeItem("auth_token");
    // localStorage.removeItem("auth_user");

    Cookies.remove("auth_token");
    Cookies.remove("auth_user");
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  // console.log("Auth context value:", value) // Debug log

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
