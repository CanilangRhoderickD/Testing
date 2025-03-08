import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface CrosswordFormProps {
  form: any;
}

export function CrosswordForm({ form }: CrosswordFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="content.grid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grid Size</FormLabel>
              <div className="flex gap-4">
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Rows" 
                    value={field.value?.length || 5}
                    onChange={(e) => {
                      const size = parseInt(e.target.value);
                      const newGrid = Array(size).fill(null).map(() => 
                        Array(field.value?.[0]?.length || 10).fill("*")
                      );
                      field.onChange(newGrid);
                    }}
                  />
                </FormControl>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Columns" 
                    value={field.value?.[0]?.length || 10}
                    onChange={(e) => {
                      const size = parseInt(e.target.value);
                      const newGrid = field.value?.map((row: any) => 
                        Array(size).fill("*")
                      ) || [];
                      field.onChange(newGrid);
                    }}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormLabel>Clues</FormLabel>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Across</h4>
            <FormField
              control={form.control}
              name="content.clues.across"
              render={({ field }) => (
                <div className="space-y-2">
                  {Object.entries(field.value || {}).map(([number, clue]) => (
                    <div key={number} className="flex gap-2">
                      <Input
                        className="w-16"
                        value={number}
                        onChange={(e) => {
                          const newClues = { ...field.value };
                          delete newClues[number];
                          newClues[e.target.value] = clue;
                          field.onChange(newClues);
                        }}
                      />
                      <Input
                        value={clue as string}
                        onChange={(e) => {
                          field.onChange({
                            ...field.value,
                            [number]: e.target.value,
                          });
                        }}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newClues = { ...field.value };
                          delete newClues[number];
                          field.onChange(newClues);
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nextNumber = Object.keys(field.value || {}).length + 1;
                      field.onChange({
                        ...field.value,
                        [nextNumber]: "",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Across Clue
                  </Button>
                </div>
              )}
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Down</h4>
            <FormField
              control={form.control}
              name="content.clues.down"
              render={({ field }) => (
                <div className="space-y-2">
                  {Object.entries(field.value || {}).map(([number, clue]) => (
                    <div key={number} className="flex gap-2">
                      <Input
                        className="w-16"
                        value={number}
                        onChange={(e) => {
                          const newClues = { ...field.value };
                          delete newClues[number];
                          newClues[e.target.value] = clue;
                          field.onChange(newClues);
                        }}
                      />
                      <Input
                        value={clue as string}
                        onChange={(e) => {
                          field.onChange({
                            ...field.value,
                            [number]: e.target.value,
                          });
                        }}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newClues = { ...field.value };
                          delete newClues[number];
                          field.onChange(newClues);
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nextNumber = Object.keys(field.value || {}).length + 1;
                      field.onChange({
                        ...field.value,
                        [nextNumber]: "",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Down Clue
                  </Button>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
