import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSound } from "@/lib/use-sound";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { GameModule } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

  const renderGameContent = () => {
    if (!selectedModule) return null;

    switch (selectedModule.content.type) {
      case "quiz":
        return renderQuizContent(selectedModule.content.data);
      case "crossword":
        return renderCrosswordContent(selectedModule.content.data);
      case "pictureWord":
        return renderPictureWordContent(selectedModule.content.data);
      case "wordScramble":
        return renderWordScrambleContent(selectedModule.content.data);
      case "tutorial":
        return renderTutorialContent(selectedModule.content.data);
      default:
        return <p>Unsupported game type</p>;
    }
  };

  const renderQuizContent = (data: any) => {
    const state = gameState.quiz || { currentQuestion: 0, score: 0 };
    const question = data.questions[state.currentQuestion];

    return (
      <div className="space-y-6">
        <Progress
          value={((state.currentQuestion + 1) / data.questions.length) * 100}
        />
        <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
        <div className="grid gap-4">
          {question.options.map((option: string, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto py-4 px-6"
              onClick={() => handleQuizAnswer(index)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderCrosswordContent = (data: any) => {
    const state = gameState.crossword || {
      selectedCell: null,
      userAnswers: data.grid.map((row: any) => row.map(() => ""))
    };

    return (
      <div className="space-y-6">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${data.grid[0].length}, 1fr)` }}>
          {data.grid.map((row: string[], rowIndex: number) =>
            row.map((cell: string, colIndex: number) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                variant={cell === "#" ? "ghost" : "outline"}
                className={`w-12 h-12 p-0 ${
                  state.selectedCell?.row === rowIndex &&
                  state.selectedCell?.col === colIndex
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                disabled={cell === "#"}
                onClick={() => handleCrosswordCellClick(rowIndex, colIndex)}
              >
                {state.userAnswers[rowIndex][colIndex]}
              </Button>
            ))
          )}
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Across</h4>
            {data.clues.across.map((clue: any) => (
              <p key={clue.number} className="text-sm">
                {clue.number}. {clue.clue}
              </p>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Down</h4>
            {data.clues.down.map((clue: any) => (
              <p key={clue.number} className="text-sm">
                {clue.number}. {clue.clue}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
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
          <Input
            value={state.userGuess}
            onChange={(e) => handlePictureWordGuess(e.target.value)}
            placeholder="What's the word?"
            className="text-center text-xl"
          />
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

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">{state.scrambledWord}</h3>
          <p className="text-sm text-muted-foreground">Category: {data.category}</p>
        </div>
        <div className="space-y-4">
          <Input
            value={state.userGuess}
            onChange={(e) => handleWordScrambleGuess(e.target.value)}
            placeholder="Unscramble the word"
            className="text-center text-xl"
          />
          <p className="text-sm text-center">{data.hint}</p>
        </div>
      </div>
    );
  };

  const renderTutorialContent = (data: any) => {
    return (
      <div className="space-y-6">
        {data.sections.map((section: any, index: number) => (
          <div key={index}>
            <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
            <p>{section.content}</p>
          </div>
        ))}
      </div>
    );
  };

  // Game logic handlers
  const handleQuizAnswer = (selectedOption: number) => {
    if (!selectedModule) return;
    const data = selectedModule.content.data;
    const state = gameState.quiz || { currentQuestion: 0, score: 0 };

    if (selectedOption === data.questions[state.currentQuestion].correctAnswer) {
      play("correct");
      state.score += 10;
    } else {
      play("wrong");
    }

    if (state.currentQuestion < data.questions.length - 1) {
      setGameState({
        ...gameState,
        quiz: { ...state, currentQuestion: state.currentQuestion + 1 }
      });
    } else {
      play("levelUp");
      submitProgress(selectedModule.id, state.score);
      setSelectedModule(null);
      setGameState({});
    }
  };

  const handleCrosswordCellClick = (row: number, col: number) => {
    play("click");
    setGameState({
      ...gameState,
      crossword: {
        ...gameState.crossword!,
        selectedCell: { row, col }
      }
    });
  };

  const handlePictureWordGuess = (guess: string) => {
    if (!selectedModule) return;
    const state = gameState.pictureWord || { userGuess: "", attempts: 0 };

    setGameState({
      ...gameState,
      pictureWord: { ...state, userGuess: guess, attempts: state.attempts + 1 }
    });

    if (guess.toLowerCase() === selectedModule.content.data.correctWord.toLowerCase()) {
      play("correct");
      submitProgress(selectedModule.id, Math.max(0, 100 - state.attempts * 10));
      setSelectedModule(null);
      setGameState({});
    } else if (guess.length === selectedModule.content.data.correctWord.length) {
      play("wrong");
    }
  };

  const handleWordScrambleGuess = (guess: string) => {
    if (!selectedModule) return;
    setGameState({
      ...gameState,
      wordScramble: { ...gameState.wordScramble!, userGuess: guess }
    });

    if (guess.toLowerCase() === selectedModule.content.data.word.toLowerCase()) {
      play("correct");
      submitProgress(selectedModule.id, 100);
      setSelectedModule(null);
      setGameState({});
    } else if (guess.length === selectedModule.content.data.word.length) {
      play("wrong");
    }
  };

  const scrambleWord = (word: string) => {
    return word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Fire Safety Training</h1>
        <p className="text-muted-foreground">
          Complete modules to earn points and badges
        </p>
        <div className="mt-4">
          <span className="font-semibold">Total Score: </span>
          {user?.score}
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <Select value={ageFilter} onValueChange={setAgeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by age" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ages</SelectItem>
            <SelectItem value="kids">Kids (5-12)</SelectItem>
            <SelectItem value="teens">Teens (13-17)</SelectItem>
            <SelectItem value="adults">Adults (18+)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredModules?.map((module) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                play("click");
                setSelectedModule(module);
              }}
            >
              <Card
                className={`cursor-pointer transition-transform hover:scale-105 ${
                  user?.progress.completedModules.includes(module.id.toString())
                    ? "bg-muted"
                    : ""
                }`}
              >
                <CardHeader>
                  <CardTitle>{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {module.description}
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Age: {module.ageGroup}</span>
                      <span className="text-sm">Level: {module.difficulty}</span>
                    </div>
                    {user?.progress.completedModules.includes(
                      module.id.toString()
                    ) && (
                      <div className="mt-2 text-sm font-medium text-green-600">
                        Completed ✓
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={!!selectedModule} onOpenChange={() => {
        setSelectedModule(null);
        setGameState({});
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedModule?.title}</DialogTitle>
          </DialogHeader>
          {renderGameContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}