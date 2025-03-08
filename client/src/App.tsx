import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import Crossword from "@/pages/games/crossword";
import FourPics from "@/pages/games/four-pics";
import WordScramble from "@/pages/games/word-scramble";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminModules from "@/pages/admin/modules";
// Import commented out until module-details page is created
// import AdminModuleDetails from "@/pages/admin/module-details";
import AchievementsPage from "./pages/achievements-page"; 
import AdminAchievementsPage from "./pages/admin/achievements"; 
import LandingPage from "@/pages/landing-page";
import TeamPage from "./pages/team-page";
import AboutPage from "./pages/about-page";
import GamePage from "@/pages/game-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={HomePage} />
      <ProtectedRoute path="/games/crossword" component={Crossword} />
      <ProtectedRoute path="/games/four-pics" component={FourPics} />
      <ProtectedRoute path="/games/word-scramble" component={WordScramble} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/modules/:id" component={AdminModules} />
      <ProtectedRoute path="/admin/modules" component={AdminModules} />
      <ProtectedRoute path="/admin/achievements" component={AdminAchievementsPage} />
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/team" component={TeamPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/game" component={GamePage} />
      <Route component={NotFound} />
    </Switch>
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