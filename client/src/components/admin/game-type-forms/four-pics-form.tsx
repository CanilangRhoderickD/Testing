import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Minus, ImagePlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FourPicsFormProps {
  form: any;
}

interface PuzzleData {
  images: string[];
  answer: string;
  hint: string;
}

export function FourPicsForm({ form }: FourPicsFormProps) {
  const { toast } = useToast();
  const [isAddingPuzzle, setIsAddingPuzzle] = useState(false);
  const [newPuzzle, setNewPuzzle] = useState<PuzzleData>({
    images: ["", "", "", ""],
    answer: "",
    hint: "",
  });
  const [errors, setErrors] = useState<string[]>([]);

  const validateNewPuzzle = () => {
    const newErrors: string[] = [];

    if (!newPuzzle.images.every(img => img.trim() !== "")) {
      newErrors.push("All image URLs are required");
    }
    if (!newPuzzle.answer.trim()) {
      newErrors.push("Answer is required");
    }
    if (!newPuzzle.hint.trim()) {
      newErrors.push("Hint is required");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleAddPuzzle = () => {
    if (!validateNewPuzzle()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const currentContent = form.getValues("content");
    form.setValue("content", {
      ...currentContent,
      puzzles: [...(currentContent.puzzles || []), { ...newPuzzle }],
    });

    setNewPuzzle({ images: ["", "", "", ""], answer: "", hint: "" });
    setErrors([]);
    setIsAddingPuzzle(false);

    toast({
      title: "Success",
      description: "Puzzle added successfully",
    });
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="content.puzzles"
        render={({ field }) => (
          <div className="space-y-4">
            {(field.value || []).map((puzzle: PuzzleData, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Puzzle {index + 1}</h3>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newPuzzles = [...field.value];
                      newPuzzles.splice(index, 1);
                      field.onChange(newPuzzles);
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {puzzle.images.map((image: string, imgIndex: number) => (
                    <div key={imgIndex}>
                      <p className="text-sm text-muted-foreground mb-2">Image {imgIndex + 1}</p>
                      <Input value={image} disabled />
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Answer</p>
                  <Input value={puzzle.answer} disabled />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Hint</p>
                  <Input value={puzzle.hint} disabled />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setIsAddingPuzzle(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Puzzle
            </Button>
          </div>
        )}
      />

      <Dialog open={isAddingPuzzle} onOpenChange={(open) => {
        if (!open) {
          setNewPuzzle({ images: ["", "", "", ""], answer: "", hint: "" });
          setErrors([]);
        }
        setIsAddingPuzzle(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Puzzle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {errors.length > 0 && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {errors.map((error, i) => (
                  <p key={i}>{error}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {newPuzzle.images.map((image, index) => (
                <FormItem key={index}>
                  <FormLabel>Image {index + 1}</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        value={image}
                        onChange={(e) => {
                          const newImages = [...newPuzzle.images];
                          newImages[index] = e.target.value;
                          setNewPuzzle({ ...newPuzzle, images: newImages });
                          setErrors([]);
                        }}
                        placeholder="Image URL"
                      />
                      <Button variant="outline" size="icon">
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              ))}
            </div>

            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <Input
                  value={newPuzzle.answer}
                  onChange={(e) => {
                    setNewPuzzle({ ...newPuzzle, answer: e.target.value });
                    setErrors([]);
                  }}
                  placeholder="Enter the answer"
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Hint</FormLabel>
              <FormControl>
                <Input
                  value={newPuzzle.hint}
                  onChange={(e) => {
                    setNewPuzzle({ ...newPuzzle, hint: e.target.value });
                    setErrors([]);
                  }}
                  placeholder="Enter a hint"
                />
              </FormControl>
            </FormItem>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setNewPuzzle({ images: ["", "", "", ""], answer: "", hint: "" });
                  setErrors([]);
                  setIsAddingPuzzle(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPuzzle}>
                Add Puzzle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}