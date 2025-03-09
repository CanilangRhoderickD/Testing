
import React from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
}

function GameCard({ title, description, href }: GameCardProps) {
  // Generate icon based on game title
  const getGameIcon = (gameTitle: string) => {
    if (gameTitle.toLowerCase().includes('fire')) return '🔥';
    if (gameTitle.toLowerCase().includes('word')) return '📝';
    if (gameTitle.toLowerCase().includes('cross')) return '✏️';
    return '🎮';
  };

  return (
    <Card className="hover:shadow-md transition-shadow hover:scale-105 duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <span className="text-4xl">{getGameIcon(title)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-4 rounded-md mb-4">
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button asChild className="w-full">
          <Link href={href}>Play Now</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

const GamePage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  
  const { data: game, isLoading } = useQuery({
    queryKey: [`/api/games/${id}`],
    queryFn: () => apiRequest("GET", `/api/games/${id}`),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!id) {
    // Show game selection page
    return (
      <div className="container mx-auto py-8">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-8 rounded-xl mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Educational Games
              </h1>
              <p className="mt-2 text-lg text-muted-foreground max-w-xl">
                Learn essential fire safety skills through interactive and engaging games designed for all ages.
              </p>
            </div>
            <div className="flex items-center space-x-4 text-5xl">
              <span className="animate-bounce delay-100">🔥</span>
              <span className="animate-bounce delay-200">🎮</span>
              <span className="animate-bounce delay-300">📚</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">Choose a Game</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameCard 
            title="Fire Safety" 
            description="Learn about fire prevention and safety through interactive games" 
            href="/games/fire-safety" 
          />
          <GameCard 
            title="Word Scramble" 
            description="Unscramble fire safety related words" 
            href="/games/word-scramble" 
          />
          <GameCard 
            title="Crossword" 
            description="Test your knowledge with fire safety crossword puzzles" 
            href="/games/crossword" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/games" className="text-primary hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Games
        </Link>
      </div>
      
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4">
          <CardHeader>
            <div className="flex items-center">
              <span className="text-4xl mr-4">
                {game?.title?.toLowerCase().includes('fire') ? '🔥' : 
                 game?.title?.toLowerCase().includes('word') ? '📝' : 
                 game?.title?.toLowerCase().includes('cross') ? '✏️' : '🎮'}
              </span>
              <CardTitle className="text-3xl">{game?.title || "Game"}</CardTitle>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-6">
          <div className="bg-card/50 p-4 rounded-lg border border-border/50 mb-6">
            <p className="text-lg">{game?.description || "Game description will appear here"}</p>
          </div>
          
          <div className="mt-8 bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            </div>
            <p className="text-center text-lg">Game #{id} content is loading...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamePage;
