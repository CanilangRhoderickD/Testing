import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface PuzzleData {
  images: string[];
  answer: string;
  hint: string;
}

const puzzles: PuzzleData[] = [
  {
    images: [
      "https://placehold.co/150x150?text=Fire+Extinguisher",
      "https://placehold.co/150x150?text=Fire+Blanket",
      "https://placehold.co/150x150?text=Water+Hose",
      "https://placehold.co/150x150?text=Sand+Bucket"
    ],
    answer: "extinguish",
    hint: "To put out or quench a fire"
  },
  {
    images: [
      "https://placehold.co/150x150?text=Smoke+Detector",
      "https://placehold.co/150x150?text=Fire+Alarm",
      "https://placehold.co/150x150?text=Warning+Light",
      "https://placehold.co/150x150?text=Emergency+Bell"
    ],
    answer: "alert",
    hint: "To notify of danger"
  }
];

export default function FourPics() {
  const { toast } = useToast();
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [guess, setGuess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const isCorrect = guess.toLowerCase() === puzzles[currentPuzzle].answer;
    
    try {
      await apiRequest("POST", "/api/progress", {
        gameType: "four_pics",
        completed: isCorrect,
        score: isCorrect ? 100 : 0,
      });

      if (isCorrect) {
        toast({
          title: "Correct!",
          description: "Great job! Moving to next puzzle...",
        });
        
        if (currentPuzzle < puzzles.length - 1) {
          setCurrentPuzzle(currentPuzzle + 1);
          setGuess("");
          setShowHint(false);
        } else {
          toast({
            title: "Congratulations!",
            description: "You've completed all puzzles!",
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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>4 Pics 1 Word - Fire Safety Edition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {puzzles[currentPuzzle].images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`Clue ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
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
                  onClick={handleSubmit}
                  disabled={isSubmitting || !guess}
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

              <Button
                variant="outline"
                onClick={() => setShowHint(true)}
                disabled={showHint}
              >
                Show Hint
              </Button>

              {showHint && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Hint: {puzzles[currentPuzzle].hint}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
