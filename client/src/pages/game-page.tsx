
import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import axios from 'axios';
import { GameModule } from '@shared/schema';
import WordScramble from './games/word-scramble';
import Crossword from './games/crossword';
import FourPics from './games/four-pics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GamePage: React.FC = () => {
  const [, params] = useRoute('/game/:id');
  const [gameModule, setGameModule] = useState<GameModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameModule = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/modules/${params?.id}`);
        setGameModule(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch game module:', err);
        setError('Failed to load game. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchGameModule();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading game...</p>
      </div>
    );
  }

  if (error || !gameModule) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Game Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error || 'Game not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the appropriate game based on the content type
  const renderGame = () => {
    if (!gameModule.content) {
      return <p>This game module has no content.</p>;
    }

    switch (gameModule.content.type) {
      case 'wordScramble':
        return <WordScramble module={gameModule} />;
      case 'crossword':
        return <Crossword module={gameModule} />;
      case 'pictureWord':
        return <FourPics module={gameModule} />;
      case 'tutorial':
        return (
          <div className="tutorial-content">
            <h2 className="text-2xl font-bold mb-4">{gameModule.title}</h2>
            <p className="mb-6">{gameModule.description}</p>
            {gameModule.content.data.sections.map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
        );
      default:
        return <p>Unknown game type: {gameModule.content.type}</p>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{gameModule.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderGame()}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamePage;
