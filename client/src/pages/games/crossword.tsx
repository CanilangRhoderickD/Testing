import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface CrosswordCell {
  letter: string;
  number?: number;
  isStart: boolean;
  orientation: "across" | "down" | null;
}

const puzzleData = {
  grid: [
    ["F", "I", "R", "E", "*", "S", "M", "O", "K", "E"],
    ["L", "*", "*", "X", "*", "P", "*", "*", "*", "X"],
    ["A", "L", "A", "R", "M", "*", "W", "A", "T", "E"],
    ["M", "*", "*", "I", "*", "A", "*", "*", "*", "R"],
    ["E", "S", "C", "A", "P", "E", "*", "H", "O", "T"],
  ],
  clues: {
    across: {
      1: "Emergency that requires immediate evacuation",
      3: "Warning signal for danger",
      5: "Safe way out of a burning building",
    },
    down: {
      1: "Visible warning sign of fire",
      2: "Important tool for putting out fires",
      4: "Temperature warning",
    },
  },
};

export default function Crossword() {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/progress", {
        gameType: "crossword",
        completed: true,
        score: calculateScore(),
      });

      toast({
        title: "Puzzle completed!",
        description: `You scored ${calculateScore()} points!`,
      });
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

  const calculateScore = () => {
    let correct = 0;
    const totalClues = Object.keys(puzzleData.clues.across).length + 
                      Object.keys(puzzleData.clues.down).length;
    
    // Calculate correct answers (simplified scoring)
    correct += answers["1-across"]?.toLowerCase() === "fire" ? 1 : 0;
    correct += answers["3-across"]?.toLowerCase() === "alarm" ? 1 : 0;
    correct += answers["5-across"]?.toLowerCase() === "escape" ? 1 : 0;
    correct += answers["1-down"]?.toLowerCase() === "flame" ? 1 : 0;
    correct += answers["2-down"]?.toLowerCase() === "water" ? 1 : 0;
    correct += answers["4-down"]?.toLowerCase() === "hot" ? 1 : 0;

    return Math.round((correct / totalClues) * 100);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Fire Safety Crossword</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-4">Across</h3>
                {Object.entries(puzzleData.clues.across).map(([number, clue]) => (
                  <div key={`across-${number}`} className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      {number}. {clue}
                    </label>
                    <Input
                      value={answers[`${number}-across`] || ""}
                      onChange={(e) => 
                        setAnswers({
                          ...answers,
                          [`${number}-across`]: e.target.value
                        })
                      }
                      className="max-w-xs"
                    />
                  </div>
                ))}

                <h3 className="font-semibold mb-4 mt-6">Down</h3>
                {Object.entries(puzzleData.clues.down).map(([number, clue]) => (
                  <div key={`down-${number}`} className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      {number}. {clue}
                    </label>
                    <Input
                      value={answers[`${number}-down`] || ""}
                      onChange={(e) =>
                        setAnswers({
                          ...answers,
                          [`${number}-down`]: e.target.value
                        })
                      }
                      className="max-w-xs"
                    />
                  </div>
                ))}

                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking answers...
                    </>
                  ) : (
                    "Submit Answers"
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-10 gap-1">
                {puzzleData.grid.map((row, i) =>
                  row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`aspect-square flex items-center justify-center border ${
                        cell === "*" ? "bg-black" : "bg-white"
                      }`}
                    >
                      {cell !== "*" && (
                        <span className="text-sm font-semibold">{cell}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
