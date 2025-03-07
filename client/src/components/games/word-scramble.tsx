import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface WordScrambleProps {
  data: {
    word: string;
    hint: string;
    category: string;
  };
}

// Helper function to scramble a word
function scrambleWord(word: string): string {
  const array = word.split("");
  let currentIndex = array.length;
  let temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  const scrambled = array.join("");
  // If we accidentally got the same word, scramble again
  return scrambled === word ? scrambleWord(word) : scrambled;
}

export function WordScramble({ data }: WordScrambleProps) {
  const [scrambledWord] = useState(() => scrambleWord(data.word));
  const [userGuess, setUserGuess] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = userGuess.trim().toUpperCase() === data.word.toUpperCase();
    setIsCorrect(correct);
  };

  const handleReset = () => {
    setUserGuess("");
    setIsCorrect(null);
    setShowHint(false);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Word Scramble</CardTitle>
        <p className="text-sm text-gray-500">Category: {data.category}</p>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-2xl font-bold tracking-widest mb-2">{scrambledWord}</p>
          {showHint && (
            <div className="bg-amber-100 p-2 rounded-md mt-2">
              <p className="text-amber-800">Hint: {data.hint}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="Enter your guess"
            className="text-center"
            disabled={isCorrect === true}
          />

          <div className="flex justify-center space-x-2">
            <Button 
              type="submit" 
              disabled={!userGuess || isCorrect === true}
            >
              Check Answer
            </Button>

            {!showHint && !isCorrect && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowHint(true)}
              >
                Show Hint
              </Button>
            )}
          </div>
        </form>

        {isCorrect !== null && (
          <div className={`mt-4 p-3 rounded-md text-center ${isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {isCorrect 
              ? "Correct! You solved the word scramble!" 
              : "That's not correct. Try again!"}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          New Word
        </Button>
      </CardFooter>
    </Card>
  );
}