import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ProgressBar } from "@/components/games/progress-bar";
import { Loader2, RefreshCw } from "lucide-react";

interface Word {
  original: string;
  scrambled: string;
  hint: string;
}

const words: Word[] = [
  {
    original: "extinguisher",
    scrambled: "xinturesheg",
    hint: "Device used to put out small fires"
  },
  {
    original: "evacuation",
    scrambled: "vuaecation",
    hint: "Process of leaving a dangerous area"
  },
  {
    original: "emergency",
    scrambled: "grmyenece",
    hint: "Urgent situation requiring immediate action"
  },
  {
    original: "firefighter",
    scrambled: "rifghteeifr",
    hint: "Professional who combats fires"
  }
];

function scrambleWord(word: string): string {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export default function WordScramble() {
  const { toast } = useToast();
  const [currentWord, setCurrentWord] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentScrambled, setCurrentScrambled] = useState(words[0].scrambled);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const isCorrect = guess.toLowerCase() === words[currentWord].original.toLowerCase();

    try {
      await apiRequest("POST", "/api/progress", {
        gameType: "word_scramble",
        completed: isCorrect,
        score: score + (isCorrect ? 25 : 0),
      });

      if (isCorrect) {
        setScore(score + 25);
        toast({
          title: "Correct!",
          description: "Great job! Moving to next word...",
        });

        if (currentWord < words.length - 1) {
          setCurrentWord(currentWord + 1);
          setGuess("");
          setCurrentScrambled(words[currentWord + 1].scrambled);
        } else {
          toast({
            title: "Congratulations!",
            description: `You've completed all words with a score of ${score + 25}!`,
          });
        }
      } else {
        toast({
          title: "Try again",
          description: "That's not quite right",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error saving progress",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReshuffle = () => {
    setCurrentScrambled(scrambleWord(words[currentWord].original));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Word Scramble - Fire Safety Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">{currentScrambled}</p>
                <p className="text-sm text-muted-foreground">
                  Hint: {words[currentWord].hint}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Type your answer..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleReshuffle}
                    title="Reshuffle letters"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !guess}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {currentWord + 1} of {words.length} words
                  </span>
                </div>
                <ProgressBar 
                  value={score} 
                  max={words.length * 25} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
