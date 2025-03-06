import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/api";
import useSound from "@/hooks/use-sound";
import { TutorialContent } from "@/components/game/tutorial-content";
import { hasMultipleInstances, calculatePoints, formatTime, scrambleWord } from "@/lib/game-utils";

interface GameModule {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  content: any;
  difficulty: string;
  ageGroup: string;
}

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

  // Check if the module has multiple instances
  const hasMultipleInstances = selectedModule?.content?.instances && 
    Array.isArray(selectedModule.content.instances) && 
    selectedModule.content.instances.length > 0;

  const handlePictureWordGuess = (guess: string) => {
    if (!selectedModule) return;

    const data = hasMultipleInstances 
      ? selectedModule.content.instances[currentInstanceIndex] 
      : selectedModule.content.data;

    setGameState(prev => ({
      ...prev,
      pictureWord: {
        userGuess: guess,
        attempts: prev.pictureWord?.attempts || 0
      }
    }));

    // Check if correct on enter key
    if (guess.toLowerCase() === data.correctWord.toLowerCase()) {
      play("success");
      submitProgress(selectedModule.id, 100);
    }
  };

  const renderPictureWordContent = (data: any) => {
    const state = gameState.pictureWord || { userGuess: "", attempts: 0 };

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
              onChange={(e) => handlePictureWordGuess(e.target.value)}
              placeholder="What's the word?"
              className="text-center text-xl"
              maxLength={data.correctWord.length}
            />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Attempts: {state.attempts}
          </p>
        </div>
      </div>
    );
  };

  const renderWordScrambleContent = (data: any) => {
    const state = gameState.wordScramble || {
      userGuess: "",
      scrambledWord: scrambleWord(data.word)
    };

    const handleScrambleGuess = (e: React.ChangeEvent<HTMLInputElement>) => {
      const guess = e.target.value.toUpperCase();
      setGameState(prev => ({
        ...prev,
        wordScramble: {
          ...prev.wordScramble!,
          userGuess: guess
        }
      }));
      
      // Check if the guess is correct
      if (guess.toLowerCase() === data.word.toLowerCase()) {
        play("success");
        submitProgress(selectedModule!.id, 100);
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
            onChange={handleScrambleGuess}
            placeholder="Enter your guess"
            className="text-center text-xl"
            maxLength={state.scrambledWord.length}
          />
        </div>
      </div>
    );
  };

  const renderCrosswordContent = (data: any) => {
    const state = gameState.crossword || {
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
                          ...gameState,
                          crossword: {
                            ...state,
                            userAnswers: newAnswers
                          }
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

  const renderQuizContent = (data: any) => {
    const state = gameState.quiz || { currentQuestion: 0, score: 0 };

    // Check if data has the expected structure, if not, show a friendly error
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      return (
        <div className="space-y-6 text-center">
          <p className="text-red-500">This quiz content is not properly formatted.</p>
          <p>Required format: JSON with a 'questions' array containing question objects.</p>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify({
              questions: [
                {
                  question: "Sample question?",
                  options: ["Option A", "Option B", "Option C", "Option D"],
                  correctAnswer: 0
                }
              ]
            }, null, 2)}
          </pre>
        </div>
      );
    }

    const question = data.questions[state.currentQuestion];

    const handleAnswerSelection = (optionIndex: number) => {
      if (!selectedModule) return;

      const isCorrect = optionIndex === question.correctAnswer;

      if (isCorrect) {
        play("success");
      } else {
        play("error");
      }

      const newState = {
        currentQuestion: state.currentQuestion + 1,
        score: isCorrect ? state.score + 1 : state.score
      };

      setGameState({...gameState, quiz: newState});

      // If last question, submit progress
      if (state.currentQuestion === data.questions.length - 1) {
        const finalScore = isCorrect ? (state.score + 1) / data.questions.length * 100 : state.score / data.questions.length * 100;
        submitProgress(selectedModule.id, finalScore);
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
          <Button onClick={() => setGameState({...gameState, quiz: { currentQuestion: 0, score: 0 }})}>
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

  const renderTutorialContent = (data: any) => {
    return (
      <TutorialContent 
        data={data}
        onComplete={() => submitProgress(selectedModule!.id, 100)}
      />
    );
  };

  // Function to render the appropriate game component based on content type and instance
  const renderGameComponent = (content: any, instanceIndex?: number) => {
    const idx = instanceIndex !== undefined ? instanceIndex : currentInstanceIndex;
    const contentData = hasMultipleInstances 
      ? selectedModule!.content.instances[idx] 
      : selectedModule!.content.data;

    switch (selectedModule!.content.type) {
      case "wordScramble":
        return (
          <WordScrambleGame 
            data={contentData} 
            gameState={gameState.wordScramble} 
            setGameState={(state) => setGameState({...gameState, wordScramble: state})}
            onComplete={(score) => submitProgress(selectedModule!.id, score)}
          />
        );
      case "pictureWord":
        return (
          <PictureWordGame 
            data={contentData} 
            gameState={gameState.pictureWord}
            setGameState={(state) => setGameState({...gameState, pictureWord: state})}
            onComplete={(score) => submitProgress(selectedModule!.id, score)}
          />
        );
      case "quiz":
        return (
          <QuizGame 
            data={contentData}
            gameState={gameState.quiz}
            setGameState={(state) => setGameState({...gameState, quiz: state})}
            onComplete={(score) => submitProgress(selectedModule!.id, score)}
          />
        );
      case "crossword":
        return (
          <CrosswordGame 
            data={contentData}
            gameState={gameState.crossword}
            setGameState={(state) => setGameState({...gameState, crossword: state})}
            onComplete={(score) => submitProgress(selectedModule!.id, score)}
          />
        );
      case "tutorial":
        return (
          <TutorialContent 
            data={contentData}
            onComplete={() => submitProgress(selectedModule!.id, 100)}
          />
        );
      default:
        return <div>Unknown game type</div>;
    }
  };

  // Render the game content within the dialog
  const renderGameContent = () => {
    if (!selectedModule) return null;

    // If module has multiple instances, show instance navigation
    if (hasMultipleInstances) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <Button 
              variant="outline" 
              onClick={() => setCurrentInstanceIndex(prev => Math.max(0, prev - 1))}
              disabled={currentInstanceIndex === 0}
            >
              Previous
            </Button>
            <span className="text-sm font-medium">
              Instance {currentInstanceIndex + 1} of {selectedModule.content.instances.length}
            </span>
            <Button 
              variant="outline"
              onClick={() => setCurrentInstanceIndex(prev => 
                Math.min(selectedModule.content.instances.length - 1, prev + 1))}
              disabled={currentInstanceIndex === selectedModule.content.instances.length - 1}
            >
              Next
            </Button>
          </div>

          {renderGameComponent(selectedModule.content, currentInstanceIndex)}
        </div>
      );
    }

    // If single instance, render directly
    return renderGameComponent(selectedModule.content);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Fire Safety Interactive Games</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <div>
          <label className="text-sm font-medium">Age Group:</label>
          <select 
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="ml-2 border rounded p-1"
          >
            <option value="all">All Ages</option>
            <option value="kids">Kids (5-8)</option>
            <option value="preteens">Pre-teens (9-12)</option>
            <option value="teens">Teens (13-17)</option>
            <option value="adults">Adults (18+)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Difficulty:</label>
          <select 
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="ml-2 border rounded p-1"
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading games...</div>
      ) : filteredModules && filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Card key={module.id} className="overflow-hidden h-full flex flex-col">
              <div className="aspect-video bg-muted">
                {module.imageUrl && (
                  <img 
                    src={module.imageUrl} 
                    alt={module.title} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="mb-2 flex gap-2">
                  <Badge>{module.difficulty}</Badge>
                  <Badge variant="outline">{module.ageGroup}</Badge>
                </div>
                <h3 className="text-lg font-bold mb-2">{module.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 flex-1">{module.description}</p>
                <Button 
                  onClick={() => {
                    setSelectedModule(module);
                    setGameState({});
                    setCurrentInstanceIndex(0);
                  }}
                >
                  Play Game
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          No games found matching your filters.
        </div>
      )}

      <Dialog open={!!selectedModule} onOpenChange={() => {
        setSelectedModule(null);
        setGameState({});
      }}>
        <DialogContent className="w-[95vw] max-w-[90vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-4xl h-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedModule?.title}</DialogTitle>
          </DialogHeader>
          {renderGameContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Game component types
const WordScrambleGame = ({ data, gameState, setGameState, onComplete }: any) => {
  const state = gameState || { userGuess: "", scrambledWord: scrambleWord(data.word) };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const guess = e.target.value.toUpperCase();
    setGameState({ ...state, userGuess: guess });

    // Check if the guess matches the word (case insensitive)
    if (guess.toLowerCase() === data.word.toLowerCase()) {
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
        <div className="flex flex-col items-center gap-2">
          <div className="bg-muted px-4 py-2 rounded-md mb-2">
            <p className="text-sm font-medium">Word length: {data.word.length} letters</p>
          </div>
          <Input
            value={state.userGuess}
            onChange={handleInputChange}
            placeholder="Enter your guess"
            className="text-center text-xl"
            maxLength={state.scrambledWord.length}
          />
          {data.hint && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Hint: {data.hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const PictureWordGame = ({ data, gameState, setGameState, onComplete }: any) => {
  const state = gameState || { userGuess: "", attempts: 0 };

  const handleGuess = (e: React.ChangeEvent<HTMLInputElement>) => {
    const guess = e.target.value;
    setGameState({ ...state, userGuess: guess });

    if (guess.toLowerCase() === data.correctWord.toLowerCase()) {
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