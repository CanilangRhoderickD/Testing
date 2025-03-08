
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { AchievementCard } from '@/components/achievements/achievement-card';
import { Sidebar } from '@/components/layout/sidebar';
import { Achievement } from '@shared/schema';

export default function AchievementsPage() {
  const { user } = useAuth();

  const { data: achievements, isLoading: loadingAchievements } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  const { data: userAchievements, isLoading: loadingUserAchievements } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements', user?.id],
    enabled: !!user,
  });

  const isLoading = loadingAchievements || loadingUserAchievements;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">My Achievements</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Progress</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-lg font-medium">Level</div>
              <div className="text-3xl font-bold">{user?.level || 1}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-lg font-medium">XP</div>
              <div className="text-3xl font-bold">{user?.xp || 0}</div>
              <div className="text-sm text-gray-500">Next level: {(Math.floor((user?.xp || 0) / 100) + 1) * 100} XP</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-lg font-medium">Points</div>
              <div className="text-3xl font-bold">{user?.points || 0}</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements?.map(achievement => {
            const isEarned = userAchievements?.some(ua => ua.id === achievement.id);
            return (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                earned={isEarned} 
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
