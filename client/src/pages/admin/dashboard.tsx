import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { GameModule, GameType } from "@shared/schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";


// Define game types
const gameTypes = {
  quiz: {
    label: "Quiz Game",
    description: "Multiple-choice questions with correct answers",
    fields: ["question", "options", "correctAnswer"]
  },
  memory: {
    label: "Memory Match",
    description: "Matching pairs of cards with fire safety concepts",
    fields: ["pairs"]
  },
  sorting: {
    label: "Sorting Game",
    description: "Sort items into correct categories",
    fields: ["categories", "items"]
  },
  simulation: {
    label: "Emergency Simulation",
    description: "Interactive scenario with decision points",
    fields: ["scenario", "decisions", "outcomes"]
  },
  crossword: {
    label: "Crossword",
    description: "Classic crossword puzzle",
    fields: ["crosswordJson"]
  },
  wordScramble: {
    label: "Word Scramble",
    description: "Unscramble the letters to form a word",
    fields: ["word"]
  },
  pictureWord: {
    label: "4 Pics 1 Word",
    description: "Guess the word based on four pictures",
    fields: ["images", "correctWord"]
  }
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [modules, setModules] = useState<GameModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<GameType | "">("");
  const [selectedModule, setSelectedModule] = useState<GameModule | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [useMultipleInstances, setUseMultipleInstances] = useState(false);

  const [newModule, setNewModule] = useState<Partial<GameModule>>({
    title: "",
    description: "",
    content: {
      type: "" as GameType,
      data: {}
    },
    settings: {
      timeLimit: 0,
      difficulty: "medium",
      allowMultipleInstances: false
    }
  });

  // Load modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch("/api/modules");
        const data = await response.json();
        if (response.ok) {
          setModules(data);
        } else {
          console.error("Error fetching modules:", data);
          toast.error("Failed to load game modules");
        }
      } catch (error) {
        console.error("API error:", error);
        toast.error("Network error while loading modules");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (!isDialogOpen) {
      setNewModule({
        title: "",
        description: "",
        content: {
          type: "" as GameType,
          data: {}
        },
        settings: {
          timeLimit: 0,
          difficulty: "medium",
          allowMultipleInstances: false
        }
      });
      setSelectedModule(null);
      setSelectedType("");
      setUseMultipleInstances(false);
    } else if (selectedModule) {
      setNewModule({
        ...selectedModule
      });
      setUseMultipleInstances(selectedModule.settings?.allowMultipleInstances || false);
    }
  }, [isDialogOpen, selectedModule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newModule.title || !newModule.content?.type) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      // Prepare the data
      const moduleData = {
        ...newModule,
        settings: {
          ...newModule.settings,
          allowMultipleInstances: useMultipleInstances
        }
      };

      // Determine if this is an edit or a new module
      const method = selectedModule ? "PUT" : "POST";
      const url = selectedModule
        ? `/api/modules/${selectedModule.id}`
        : "/api/modules";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(moduleData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(selectedModule ? "Module updated successfully" : "Module created successfully");

        // Update the local state
        if (selectedModule) {
          setModules(modules.map(mod =>
            mod.id === selectedModule.id ? data : mod
          ));
        } else {
          setModules([...modules, data]);
        }

        setIsDialogOpen(false);
      } else {
        console.error("API error:", data);
        toast.error(selectedModule ? "Failed to update module" : "Failed to create module");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGameTypeChange = (value: string) => {
    setSelectedType(value as GameType);
    setNewModule({
      ...newModule,
      content: {
        type: value as GameType,
        data: {}
      }
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("content.")) {
      // Handle content.data fields
      const field = name.split(".")[1];
      setNewModule({
        ...newModule,
        content: {
          ...newModule.content,
          data: {
            ...newModule.content?.data,
            [field]: value
          }
        }
      });
    } else if (name.startsWith("settings.")) {
      // Handle settings fields
      const field = name.split(".")[1];
      setNewModule({
        ...newModule,
        settings: {
          ...newModule.settings,
          [field]: field === "timeLimit" ? parseInt(value) || 0 : value
        }
      });
    } else {
      // Handle top-level fields
      setNewModule({
        ...newModule,
        [name]: value
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedModule) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/modules/${selectedModule.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Module deleted successfully");
        setModules(modules.filter(mod => mod.id !== selectedModule.id));
        setIsDeleteDialogOpen(false);
      } else {
        const data = await response.json();
        console.error("API error:", data);
        toast.error("Failed to delete module");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (module: GameModule) => {
    setSelectedModule(module);
    setSelectedType(module.content.type);
    setUseMultipleInstances(module.settings?.allowMultipleInstances || false);
    setIsDialogOpen(true);
  };

  const toggleMultipleInstances = () => {
    setUseMultipleInstances(!useMultipleInstances);
  };

  const confirmDelete = (module: GameModule) => {
    setSelectedModule(module);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveModule = async () => {
    if (!newModule.title || !newModule.description || !newModule.content?.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Process game-specific data before saving
      let moduleToSave = { ...newModule };

      // Process crossword JSON
      if (newModule.content?.type === "crossword" && newModule.content?.data?.crosswordJson) {
        try {
          const parsedCrossword = JSON.parse(newModule.content.data.crosswordJson);
          moduleToSave = {
            ...moduleToSave,
            content: {
              ...moduleToSave.content,
              data: parsedCrossword
            }
          };
        } catch (error) {
          toast.error("Invalid crossword JSON format");
          return;
        }
      }

      // Validate picture word game has exactly 4 images
      if (newModule.content?.type === "pictureWord") {
        const images = newModule.content?.data?.images || [];

        if (!Array.isArray(images) || images.length !== 4) {
          toast.error("Picture Word game requires exactly 4 images");
          return;
        }

        if (!newModule.content?.data?.correctWord) {
          toast.error("Please provide a correct word for the Picture Word game");
          return;
        }
      }

      // Validate word scramble has required fields
      if (newModule.content?.type === "wordScramble") {
        if (!newModule.content?.data?.word) {
          toast.error("Please provide a word for the Word Scramble game");
          return;
        }
      }

      const response = await fetch("/api/modules", {
        method: selectedModule ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedModule?.id,
          ...moduleToSave,
        }),
      });

      if (response.ok) {
        toast.success(`Module ${selectedModule ? "updated" : "created"} successfully`);
        setIsDialogOpen(false);
        fetchModules();
        setNewModule({
          title: "",
          description: "",
          content: {
            type: "" as GameType,
            data: {}
          },
          settings: {
            timeLimit: 0,
            difficulty: "medium",
          }
        });
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.message || "Failed to save module"}`);
      }
    } catch (error) {
      console.error("Error saving module:", error);
      toast.error("Failed to save module");
    }
  };


  if (loading && modules.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Game Modules</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Module
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="sorting">Sorting</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="crossword">Crossword</TabsTrigger>
            <TabsTrigger value="wordScramble">Word Scramble</TabsTrigger>
            <TabsTrigger value="pictureWord">4 Pics 1 Word</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No modules found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{module.title}</TableCell>
                      <TableCell>{gameTypes[module.content.type]?.label || module.content.type}</TableCell>
                      <TableCell className="capitalize">{module.settings?.difficulty || "medium"}</TableCell>
                      <TableCell>{module.settings?.timeLimit || "No limit"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(module)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => confirmDelete(module)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Filter tabs for each game type */}
          {Object.entries(gameTypes).map(([type, info]) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Time Limit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.filter(m => m.content.type === type).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No {info.label} modules found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    modules
                      .filter(m => m.content.type === type)
                      .map((module) => (
                        <TableRow key={module.id}>
                          <TableCell className="font-medium">{module.title}</TableCell>
                          <TableCell className="capitalize">{module.settings?.difficulty || "medium"}</TableCell>
                          <TableCell>{module.settings?.timeLimit || "No limit"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(module)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => confirmDelete(module)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      {/* Create/Edit Module Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedModule ? "Edit Game Module" : "Create New Game Module"}
            </DialogTitle>
            <DialogDescription>
              {selectedModule
                ? "Update the details for this game module."
                : "Fill in the details to create a new game module."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveModule} className="space-y-4"> {/* Changed onSubmit handler */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newModule.title || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="gameType">Game Type</Label>
                  <Select
                    value={newModule.content?.type || ""}
                    onValueChange={handleGameTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select game type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(gameTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* End of first section */}

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="multipleInstances"
                      checked={useMultipleInstances}
                      onChange={toggleMultipleInstances}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="multipleInstances">Enable multiple game instances</Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={newModule.description || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="settings.difficulty">Difficulty</Label>
                  <Select
                    value={newModule.settings?.difficulty || "medium"}
                    onValueChange={(value) =>
                      setNewModule({
                        ...newModule,
                        settings: {
                          ...newModule.settings,
                          difficulty: value
                        }
                      })
                    }
                  >
                    <SelectTrigger id="settings.difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="settings.timeLimit">Time Limit (seconds)</Label>
                  <Input
                    id="settings.timeLimit"
                    name="settings.timeLimit"
                    type="number"
                    min="0"
                    value={newModule.settings?.timeLimit || 0}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Dynamic fields based on selected game type */}
              {selectedType && (
                <div className="border rounded-md p-4 space-y-4">
                  <h3 className="text-sm font-semibold">
                    {gameTypes[selectedType as GameType]?.label} Configuration
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {gameTypes[selectedType as GameType]?.description}
                  </p>

                  {selectedType === "crossword" && (
                    <div>
                      <Label htmlFor="content.data.crosswordJson">Crossword JSON</Label>
                      <Textarea
                        id="content.data.crosswordJson"
                        name="content.data.crosswordJson"
                        value={newModule.content?.data.crosswordJson || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}

                  {selectedType === "wordScramble" && (
                    <div>
                      <Label htmlFor="content.data.word">Word</Label>
                      <Input
                        id="content.data.word"
                        name="content.data.word"
                        value={newModule.content?.data.word || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}

                  {selectedType === "pictureWord" && (
                    <>
                      <Label htmlFor="content.data.images">Images (comma-separated URLs)</Label>
                      <Input
                        id="content.data.images"
                        name="content.data.images"
                        value={newModule.content?.data.images || ""}
                        onChange={handleInputChange}
                      />
                      <Label htmlFor="content.data.correctWord">Correct Word</Label>
                      <Input
                        id="content.data.correctWord"
                        name="content.data.correctWord"
                        value={newModule.content?.data.correctWord || ""}
                        onChange={handleInputChange}
                      />
                    </>
                  )}

                  {/* Placeholder for other game types */}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedModule ? "Update Module" : "Create Module"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              &quot;{selectedModule?.title}&quot; module.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}