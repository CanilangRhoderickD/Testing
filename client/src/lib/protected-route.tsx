
import React, { useEffect } from "react";
import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType;
}) {
  const { user, isPending } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <Route path={path}>
      {(params) => {
        // Handling case when authentication is in progress
        if (isPending) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        // If user is not authenticated and we're not in a loading state, redirect to auth
        if (!user) {
          // Use useEffect to ensure redirect happens after render
          useEffect(() => {
            // Add a small delay to ensure state is fully updated
            const redirectTimer = setTimeout(() => {
              setLocation("/auth");
            }, 10);
            
            return () => clearTimeout(redirectTimer);
          }, []);
          
          // Show loading while redirecting
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        // User is authenticated, render the protected component
        return <Component {...params} />;
      }}
    </Route>
  );
}

export default ProtectedRoute;
