import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin/dashboard";
import FireSafetyGame from "@/pages/game/fire-safety";
import Dashboard from "@/pages/dashboard";
import GameContentGuide from "@/pages/admin/guide";
import { ProtectedRoute } from "./lib/protected-route";
import Navbar from "./components/layout/navbar";
import AdminGameTemplate from "@/pages/admin/game-template"; // Added component
import AdminFormatGuide from "@/pages/admin/format-guide"; // Added component


function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/game">
          <ProtectedRoute path="/game" component={FireSafetyGame} />
        </Route>
        <Route path="/admin">
          <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly={true} />
        </Route>
        <Route path="/admin/guide" component={GameContentGuide} />
        <Route path="/admin/template" component={AdminGameTemplate} /> {/* Added route */}
        <Route path="/admin/format-guide" component={AdminFormatGuide} /> {/* Added route */}
        <Route path="/dashboard">
          <ProtectedRoute path="/dashboard" component={Dashboard} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;