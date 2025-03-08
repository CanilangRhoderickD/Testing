import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WordScrambleFormProps {
  form: any;
}

interface WordData {
  original: string;
  scrambled: string;
  hint: string;
}

export function WordScrambleForm({ form }: WordScrambleFormProps) {
  const { toast } = useToast();
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [newWord, setNewWord] = useState<WordData>({
    original: "",
    scrambled: "",
    hint: "",
  });
  const [errors, setErrors] = useState<string[]>([]);

  const validateNewWord = () => {
    const newErrors: string[] = [];

    if (!newWord.original.trim()) {
      newErrors.push("Word is required");
    }
    if (!newWord.hint.trim()) {
      newErrors.push("Hint is required");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleAddWord = () => {
    if (!validateNewWord()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const scrambledWord = newWord.original
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    const wordToAdd = {
      ...newWord,
      scrambled: scrambledWord,
    };

    const currentContent = form.getValues("content");
    form.setValue("content", {
      ...currentContent,
      words: [...(currentContent.words || []), wordToAdd],
    });

    setNewWord({ original: "", scrambled: "", hint: "" });
    setErrors([]);
    setIsAddingWord(false);

    toast({
      title: "Success",
      description: "Word added successfully",
    });
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="content.words"
        render={({ field }) => (
          <div className="space-y-4">
            {(field.value || []).map((word: WordData, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Word {index + 1}</h3>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newWords = [...field.value];
                      newWords.splice(index, 1);
                      field.onChange(newWords);
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Original Word</p>
                  <Input value={word.original} disabled />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Scrambled Version</p>
                  <Input value={word.scrambled} disabled />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Hint</p>
                  <Input value={word.hint} disabled />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setIsAddingWord(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Word
            </Button>
          </div>
        )}
      />

      <Dialog open={isAddingWord} onOpenChange={(open) => {
        if (!open) {
          setNewWord({ original: "", scrambled: "", hint: "" });
          setErrors([]);
        }
        setIsAddingWord(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Word</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {errors.length > 0 && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {errors.map((error, i) => (
                  <p key={i}>{error}</p>
                ))}
              </div>
            )}

            <FormItem>
              <FormLabel>Original Word</FormLabel>
              <FormControl>
                <Input
                  value={newWord.original}
                  onChange={(e) => {
                    setNewWord({ ...newWord, original: e.target.value });
                    setErrors([]);
                  }}
                  placeholder="Enter the word"
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Hint</FormLabel>
              <FormControl>
                <Input
                  value={newWord.hint}
                  onChange={(e) => {
                    setNewWord({ ...newWord, hint: e.target.value });
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
                  setNewWord({ original: "", scrambled: "", hint: "" });
                  setErrors([]);
                  setIsAddingWord(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddWord}>
                Add Word
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}