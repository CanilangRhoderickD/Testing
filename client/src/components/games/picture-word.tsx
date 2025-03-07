import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PictureWordProps {
  data: {
    images: string[];
    correctWord: string;
    hints: string[];
  };
}

export function PictureWord({ data }: PictureWordProps) {
  const [userGuess, setUserGuess] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = userGuess.trim().toUpperCase() === data.correctWord.toUpperCase();
    setIsCorrect(correct);
  };

  const showNextHint = () => {
    if (currentHintIndex < data.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const handleReset = () => {
    setUserGuess("");
    setIsCorrect(null);
    setCurrentHintIndex(-1);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>4 Pics 1 Word</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {data.images.map((image, index) => (
            <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
              <img 
                src={image} 
                alt={`Clue ${index + 1}`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback for missing images
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/200x200/e5e7eb/a1a1aa?text=Image';
                }}
              />
            </div>
          ))}
        </div>

        {currentHintIndex >= 0 && (
          <div className="bg-amber-100 p-3 rounded-md mb-4">
            <p className="text-amber-800">Hint: {data.hints[currentHintIndex]}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="What's the word?"
            className="text-center text-lg"
            disabled={isCorrect === true}
          />

          <div className="flex justify-center space-x-2">
            <Button 
              type="submit" 
              disabled={!userGuess || isCorrect === true}
            >
              Check Answer
            </Button>

            {currentHintIndex < data.hints.length - 1 && !isCorrect && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={showNextHint}
              >
                Get Hint
              </Button>
            )}
          </div>
        </form>

        {isCorrect !== null && (
          <div className={`mt-4 p-3 rounded-md text-center ${isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {isCorrect 
              ? "Correct! You found the word!" 
              : "That's not correct. Try again!"}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        {isCorrect && (
          <Button variant="outline" onClick={handleReset}>
            Try Another
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}