
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import useSound from "@/hooks/use-sound";
import { GameModule, GameState } from "@/types/game";

export default function FireSafetyGame() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { play } = useSound();
  const [selectedModule, setSelectedModule] = useState<GameModule | null>(null);
  const [gameState, setGameState] = useState<GameState>({});
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [currentInstanceIndex, setCurrentInstanceIndex] = useState(0);

  const { data: modules, isLoading } = useQuery<GameModule[]>({
    queryKey: ["/api/modules"],
  });

  const submitProgress = async (moduleId: number, score: number) => {
    await apiRequest("POST", "/api/progress", { moduleId, score });
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  };

  const filteredModules = modules?.filter((module) => {
    const ageMatch = ageFilter === "all" || module.ageGroup === ageFilter;
    const difficultyMatch = difficultyFilter === "all" || module.difficulty === difficultyFilter;
    return ageMatch && difficultyMatch;
  });

  const scrambleWord = (word: string) => {
    const arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  };

  const startModule = (module: GameModule) => {
    setSelectedModule(module);
  };

  const renderContent = () => {
    if (!selectedModule?.content) return null;

    const renderWordScramble = () => {
      // Implementation for word scramble game
      return <div>Word Scramble Game</div>;
    };

    switch (selectedModule.content.type) {
      case "wordScramble":
        return renderWordScramble();
      case "pictureWord":
        return <div>Picture Word Game (Coming Soon)</div>;
      case "quiz":
        return <div>Quiz Game (Coming Soon)</div>;
      case "crossword":
        return <div>Crossword Game (Coming Soon)</div>;
      default:
        return <div>Unknown game type</div>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Fire Safety Games</h1>

      {!selectedModule ? (
        <div className="flex gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Age Group</label>
            <Select
              value={ageFilter}
              onValueChange={(value) => setAgeFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Age Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="kids">Kids</SelectItem>
                <SelectItem value="teens">Teens</SelectItem>
                <SelectItem value="adults">Adults</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Difficulty</label>
            <Select
              value={difficultyFilter}
              onValueChange={(value) => setDifficultyFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

      {!selectedModule && filteredModules ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <div 
              key={module.id} 
              className="bg-card rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startModule(module)}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                <p className="text-muted-foreground mb-4">{module.description}</p>
                <div className="flex justify-between">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                    {module.ageGroup}
                  </span>
                  <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded">
                    {module.difficulty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-md p-6">
          {selectedModule && (
            <div className="mb-4">
              <button
                onClick={() => setSelectedModule(null)}
                className="text-primary hover:underline flex items-center"
              >
                ← Back to games
              </button>
              <h2 className="text-2xl font-bold mt-4">{selectedModule.title}</h2>
            </div>
          )}
          {renderContent()}
        </div>
      )}
    </div>
  );
}
