import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GameModule } from "@/shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import { useSound } from "@/lib/use-sound";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";

const queryClient = useQueryClient();

interface GameState {
  crossword?: {
    selectedCell: { row: number; col: number } | null;
    userAnswers: string[][];
  };
  pictureWord?: {
    userGuess: string;
    attempts: number;
  };
  wordScramble?: {
    userGuess: string;
    scrambledWord: string;
    isCorrect: boolean;
  };
  quiz?: {
    currentQuestion: number;
    score: number;
  };
}

export default function FireSafetyGame() {
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

    if (module.content.type === "wordScramble") {
      const word = module.content.data.word;
      setGameState({
        wordScramble: {
          userGuess: "",
          scrambledWord: scrambleWord(word),
          isCorrect: false,
        },
      });
    } else if (module.content.type === "pictureWord") {
      setGameState({
        pictureWord: {
          userGuess: "",
          attempts: 0,
        },
      });
    } else if (module.content.type === "quiz") {
      setGameState({
        quiz: {
          currentQuestion: 0,
          score: 0,
        },
      });
    } else if (module.content.type === "crossword") {
      const grid = module.content.data.grid;
      const emptyGrid = Array(grid.length)
        .fill(null)
        .map(() => Array(grid[0].length).fill(""));

      setGameState({
        crossword: {
          selectedCell: null,
          userAnswers: emptyGrid,
        },
      });
    }
  };

  const handleWordScrambleGuess = () => {
    if (
      selectedModule &&
      gameState.wordScramble &&
      gameState.wordScramble.userGuess.toUpperCase() === selectedModule.content.data.word
    ) {
      play("correct");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setGameState({
        ...gameState,
        wordScramble: {
          ...gameState.wordScramble,
          isCorrect: true,
        },
      });

      submitProgress(selectedModule.id, 100);
    } else {
      play("wrong");
    }
  };

  const renderWordScramble = () => {
    if (!selectedModule || !gameState.wordScramble) return null;

    const { scrambledWord, userGuess, isCorrect } = gameState.wordScramble;
    const { hint, category } = selectedModule.content.data;

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Word Scramble</CardTitle>
          <CardDescription>
            Unscramble the fire safety related word
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <Badge variant="outline">{category}</Badge>
          </div>

          <div className="flex justify-center mb-6">
            {scrambledWord.split("").map((letter, i) => (
              <div
                key={i}
                className="w-10 h-10 mx-1 flex items-center justify-center bg-primary/10 rounded-md font-bold text-xl"
              >
                {letter}
              </div>
            ))}
          </div>

          <div className="mb-4">
            <p className="text-sm mb-2">Hint: {hint}</p>
          </div>

          {isCorrect ? (
            <div className="bg-green-100 p-4 rounded-md text-green-800 font-semibold text-center">
              Correct! The word is {selectedModule.content.data.word}
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Type your answer"
                value={userGuess}
                onChange={(e) =>
                  setGameState({
                    ...gameState,
                    wordScramble: {
                      ...gameState.wordScramble!,
                      userGuess: e.target.value,
                    },
                  })
                }
              />
              <Button className="w-full" onClick={handleWordScrambleGuess}>
                Check Answer
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Tip: Type the word you think is correct and click "Check Answer"
        </CardFooter>
      </Card>
    );
  };

  const renderContent = () => {
    if (!selectedModule) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {isLoading ? (
            <p>Loading games...</p>
          ) : filteredModules && filteredModules.length > 0 ? (
            filteredModules.map((module) => (
              <Card
                key={module.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => startModule(module)}
              >
                <CardHeader>
                  <CardTitle>{module.title}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{module.ageGroup}</Badge>
                    <Badge variant="outline">{module.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{module.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Start Game
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p>No games available with the selected filters.</p>
          )}
        </div>
      );
    }

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
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedModule(null);
              setGameState({});
            }}
          >
            Back to Games
          </Button>
        </div>
      )}

      {renderContent()}
    </div>
  );
}

const WordScrambleGame = ({ data, gameState, setGameState, onComplete }: any) => {
  const state = gameState || { userGuess: "", scrambledWord: scrambleWord(data.word), isCorrect: false };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const guess = e.target.value.toUpperCase();
    setGameState({ ...state, userGuess: guess });

    // Log for debugging
    console.log(`Current guess: ${guess}, Expected word: ${data.word}`);
    
    // Check if the guess matches the word (case insensitive)
    if (guess.toLowerCase() === data.word.toLowerCase()) {
      console.log("Match found!");
      setGameState({...state, isCorrect: true});
      onComplete(100);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted p-6 rounded-lg">
        <h2 className="text-center text-3xl font-bold tracking-widest">
          {state.scrambledWord}
        </h2>
      </div>

      <div className="space-y-4">
        <p className="text-center text-muted-foreground">
          Unscramble the word above related to fire safety
        </p>
        <Input
          value={state.userGuess}
          onChange={handleInputChange}
          placeholder="Enter your guess"
          className="text-center text-xl"
        />
        {state.isCorrect && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-center">
            <p className="font-medium">Correct! +100 XP</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PictureWordGame = ({ data, gameState, setGameState, onComplete }: any) => {
  const state = gameState || { userGuess: "", attempts: 0, isCorrect: false };

  const handleGuess = (e: React.ChangeEvent<HTMLInputElement>) => {
    const guess = e.target.value;
    setGameState({ ...state, userGuess: guess, attempts: state.attempts + 1 });

    if (guess.toLowerCase() === data.correctWord.toLowerCase()) {
      setGameState({...state, isCorrect: true});
      onComplete(100);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {data.images.map((image: string, index: number) => (
          <div key={index} className="aspect-square bg-muted rounded-lg">
            <img
              src={image}
              alt={`Hint ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-muted px-4 py-2 rounded-md mb-2">
            <p className="text-sm font-medium">Word length: {data.correctWord.length} letters</p>
          </div>
          <Input
            value={state.userGuess}
            onChange={handleGuess}
            placeholder="What's the word?"
            className="text-center text-xl"
            maxLength={data.correctWord.length}
          />
          {state.isCorrect && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-center w-full">
              <p className="font-medium">Correct! +100 XP</p>
            </div>
          )}
        </div>
        <p className="text-sm text-center text-muted-foreground">
          Attempts: {state.attempts}
        </p>
      </div>
    </div>
  );
};

const QuizGame = ({ data, gameState, setGameState, onComplete }: any) => {
  const state = gameState || { currentQuestion: 0, score: 0 };

  // Check if data has the expected structure
  if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-red-500">This quiz content is not properly formatted.</p>
      </div>
    );
  }

  const question = data.questions[state.currentQuestion];

  const handleAnswerSelection = (optionIndex: number) => {
    const isCorrect = optionIndex === question.correctAnswer;

    const newState = {
      currentQuestion: state.currentQuestion + 1,
      score: isCorrect ? state.score + 1 : state.score
    };

    setGameState(newState);

    // If last question, submit progress
    if (state.currentQuestion === data.questions.length - 1) {
      const finalScore = (newState.score / data.questions.length) * 100;
      onComplete(finalScore);
    }
  };

  if (state.currentQuestion >= data.questions.length) {
    const scorePercent = (state.score / data.questions.length) * 100;
    return (
      <div className="space-y-6 text-center py-8">
        <h3 className="text-2xl font-bold">Quiz completed!</h3>
        <p className="text-xl">Your score: {state.score} out of {data.questions.length}</p>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-green-600 h-4 rounded-full" style={{ width: `${scorePercent}%` }}></div>
        </div>
        <Button onClick={() => setGameState({ currentQuestion: 0, score: 0 })}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-muted-foreground">
        <div>Question {state.currentQuestion + 1} of {data.questions.length}</div>
        <div>Score: {state.score}</div>
      </div>

      <h3 className="text-xl font-medium">{question.question}</h3>

      <div className="space-y-3">
        {question.options.map((option: string, index: number) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start text-left h-auto py-3 px-4"
            onClick={() => handleAnswerSelection(index)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

const CrosswordGame = ({ data, gameState, setGameState, onComplete }: any) => {
  const state = gameState || {
    selectedCell: null,
    userAnswers: Array(data.grid.length).fill(null).map(() => 
      Array(data.grid[0].length).fill("")
    )
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-flow-row gap-0.5">
        {data.grid.map((row: string[], rowIndex: number) => (
          <div key={rowIndex} className="flex gap-0.5">
            {row.map((cell: string, colIndex: number) => (
              <div 
                key={`${rowIndex}-${colIndex}`}
                className={`w-10 h-10 border flex items-center justify-center ${
                  cell === "" ? "bg-gray-200" : "bg-white"
                }`}
              >
                {cell !== "" && (
                  <input 
                    className="w-full h-full text-center uppercase font-bold"
                    maxLength={1}
                    value={state.userAnswers[rowIndex][colIndex]}
                    onChange={(e) => {
                      const newAnswers = [...state.userAnswers];
                      newAnswers[rowIndex][colIndex] = e.target.value;
                      setGameState({
                        ...state,
                        userAnswers: newAnswers
                      });
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};