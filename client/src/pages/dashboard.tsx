
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { achievements, levelRequirements } from "@shared/schema";
import { motion } from "framer-motion";
import { Trophy, Star, Calendar, TrendingUp, Award, Target, Book } from "lucide-react";
import { useSound } from "@/lib/use-sound";

export default function Dashboard() {
  const { user } = useAuth();
  const { play } = useSound();

  if (!user) return null;
  
  // Added null checks and defaults to ensure safe access to properties
  const userProgress = user.progress || { 
    currentLevel: 1,
    badges: [],
    completedModules: [],
    dailyChallenges: []
  };

  const nextLevel = levelRequirements[userProgress.currentLevel] || levelRequirements[levelRequirements.length - 1];
  const currentLevelScore = levelRequirements[userProgress.currentLevel - 1] || 0;
  const progressToNextLevel = Math.min(100, Math.max(0, ((user.score || 0) - currentLevelScore) / (nextLevel - currentLevelScore) * 100));

  const today = new Date().toISOString().split('T')[0];
  const dailyChallenge = userProgress.dailyChallenges && userProgress.dailyChallenges.find(
    challenge => challenge && challenge.date && challenge.date.split('T')[0] === today
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Progress Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Level {userProgress.currentLevel}</div>
            <Progress value={progressToNextLevel} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {user.score || 0} / {nextLevel} XP to next level
            </p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {userProgress.badges && userProgress.badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => play("achievement")}
                  className="relative cursor-pointer"
                >
                  <Badge variant="secondary" className="w-full py-2">
                    <Star className="h-4 w-4 mr-1" />
                    {badge.name}
                  </Badge>
                  {badge.dateEarned && new Date(badge.dateEarned).toISOString().split('T')[0] === today && (
                    <div className="absolute -top-1 -right-1">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Challenge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyChallenge ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Today's Challenge</span>
                  {dailyChallenge.completed ? (
                    <Badge variant="success">Completed</Badge>
                  ) : (
                    <Badge variant="secondary">In Progress</Badge>
                  )}
                </div>
                <Progress value={dailyChallenge.completed ? 100 : 0} />
              </div>
            ) : (
              <p className="text-muted-foreground">
                No active challenge. Come back tomorrow!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Book className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">{userProgress.completedModules ? userProgress.completedModules.length : 0}</div>
              </div>
              <p className="text-sm text-muted-foreground">Modules Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">{user.score || 0}</div>
              </div>
              <p className="text-sm text-muted-foreground">Total Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">{userProgress.badges ? userProgress.badges.length : 0}</div>
              </div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">
                  {userProgress.dailyChallenges ? userProgress.dailyChallenges.filter(c => c && c.completed).length : 0}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Challenges Completed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
