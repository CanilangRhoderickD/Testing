import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { CrosswordForm } from "./game-type-forms/crossword-form";
import { FourPicsForm } from "./game-type-forms/four-pics-form";
import { WordScrambleForm } from "./game-type-forms/word-scramble-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameModuleSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";

const defaultContent = {
  crossword: {
    grid: Array(5).fill(Array(10).fill("*")),
    clues: {
      across: {},
      down: {},
    },
  },
  four_pics: {
    puzzles: [],
  },
  word_scramble: {
    words: [],
  },
};

interface GameModuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function GameModuleFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: GameModuleFormDialogProps) {
  const form = useForm({
    resolver: zodResolver(insertGameModuleSchema),
    defaultValues: {
      name: "",
      type: "crossword",
      content: defaultContent.crossword,
    },
  });

  const handleTypeChange = (type: string) => {
    form.setValue("type", type);
    form.setValue("content", defaultContent[type as keyof typeof defaultContent]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Game Module</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new game module. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter a unique name for this module" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Type</FormLabel>
                  <Select 
                    onValueChange={handleTypeChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a game type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="crossword">Crossword</SelectItem>
                      <SelectItem value="four_pics">4 Pics 1 Word</SelectItem>
                      <SelectItem value="word_scramble">Word Scramble</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("type") === "crossword" && <CrosswordForm form={form} />}
            {form.watch("type") === "four_pics" && <FourPicsForm form={form} />}
            {form.watch("type") === "word_scramble" && <WordScrambleForm form={form} />}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Module"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
