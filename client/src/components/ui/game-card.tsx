
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";

// Define game types with their labels and icons
const gameTypes = {
  tutorial: { label: "Tutorial", icon: "📚" },
  quiz: { label: "Quiz", icon: "❓" },
  wordScramble: { label: "Word Scramble", icon: "🔤" },
  pictureWord: { label: "Picture Word", icon: "🖼️" },
  interactive: { label: "Interactive", icon: "🎮" },
  simulation: { label: "Simulation", icon: "🔥" },
  assessment: { label: "Assessment", icon: "📊" }
};

interface GameCardProps {
  module: any;
  onClick: () => void;
}

export function GameCard({ module, onClick }: GameCardProps) {
  console.log("Rendering game card for module:", module);

  // Handle cases where module or content might be undefined
  if (!module) {
    console.error("Module is undefined in GameCard");
    return null;
  }

  const gameType = module.content?.type || "unknown";
  const typeInfo = gameTypes[gameType as keyof typeof gameTypes] || { 
    label: "Unknown", 
    icon: "❓" 
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Game card clicked for module:", module.id);
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <span className="text-3xl">{typeInfo.icon}</span> 
          <span className="text-2xl">{module.title || "Untitled Game"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{module.description || "No description available"}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{typeInfo.label}</Badge>
          {module.difficulty && (
            <Badge variant="outline" className="bg-blue-50">
              {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
            </Badge>
          )}
          {module.ageGroup && (
            <Badge variant="outline" className="bg-green-50">
              {module.ageGroup.charAt(0).toUpperCase() + module.ageGroup.slice(1)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
