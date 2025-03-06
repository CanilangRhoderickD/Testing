import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { InsertUser, User as SelectUser } from "@shared/schema";
import { useToast } from "./use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

interface AuthContextType {
  user: SelectUser | null;
  isLoading: boolean;
  error?: Error | null;
  loginMutation: any;
  registerMutation: any;
  logoutMutation: any;
}

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refresh auth status every 30 seconds
    staleTime: 10000 // Consider data fresh for 10 seconds
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("Attempting login with:", credentials);
        // Try both endpoints to see which one works
        let response;
        
        // Try first endpoint from auth.ts
        try {
          response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            credentials: "include"
          });
          
          if (response.ok) {
            return await response.json();
          }
        } catch (e) {
          console.log("First login endpoint failed, trying second");
        }
        
        // If we got here, try the second endpoint from routes.ts
        response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          credentials: "include"
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Login failed: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
      } catch (err) {
        console.error("Login error:", err);
        throw err;
      }
    },
    onSuccess: (userData: SelectUser) => {
      console.log("Login success, user data:", userData);
      queryClient.setQueryData(["/api/user"], userData);
      refetchUser(); // Explicitly refetch user data after login
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}