
import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import axios from "axios";
import { User } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isPending: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string, age: number) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  // Check if user is already logged in
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        console.log("Checking authentication status...");
        const response = await axios.get("/api/user", { withCredentials: true });
        console.log("Authentication check response:", response.data);
        setUser(response.data);
      } catch (error) {
        console.log("Authentication check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsPending(true);
    try {
      console.log("Login attempt for:", username);
      const response = await axios.post(
        "/api/login",
        { username, password },
        { withCredentials: true }
      );
      console.log("Login successful:", response.data);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.log("Login failed:", error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const register = async (
    username: string,
    password: string,
    age: number
  ): Promise<User> => {
    setIsPending(true);
    try {
      console.log("Registration attempt for:", username);
      const response = await axios.post(
        "/api/register",
        { username, password, age },
        { withCredentials: true }
      );
      console.log("Registration successful:", response.data);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.log("Registration failed:", error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsPending(true);
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
      setUser(null);
      queryClient.clear();
      // Redirect to the landing page after logout
      window.location.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if server request fails, clear local state
      setUser(null);
      queryClient.clear();
      window.location.replace("/");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isPending, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
