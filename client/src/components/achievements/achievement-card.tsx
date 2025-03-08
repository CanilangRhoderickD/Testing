
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { Achievement } from '@shared/schema';

interface AchievementCardProps {
  achievement: Achievement;
  earned?: boolean;
}

export function AchievementCard({ achievement, earned = false }: AchievementCardProps) {
  return (
    <Card className={`transition-all ${earned ? 'border-green-500' : 'opacity-70'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          {earned && <Trophy className="h-4 w-4 text-yellow-500" />}
          {achievement.name}
          <Badge variant={earned ? "default" : "outline"}>
            {earned ? "Earned" : "Locked"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">{achievement.description}</p>
        <p className="text-xs mt-2">
          {achievement.type === 'level' && `Reach level ${achievement.requirement}`}
          {achievement.type === 'score' && `Achieve a score of ${achievement.requirement}`}
          {achievement.type === 'completion' && `Complete ${achievement.requirement} games`}
        </p>
      </CardContent>
    </Card>
  );
}
