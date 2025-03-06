import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { GameModule } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define game type templates with multiple instances support
const gameTypes = {
  quiz: {
    label: "Quiz",
    template: {
      type: "quiz",
      data: {
        questions: [
          {
            question: "Sample question?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0
          }
        ]
      }
    },
    multipleInstancesTemplate: {
      type: "quiz",
      instances: [
        {
          questions: []
        }
      ]
    }
  },
  tutorial: {
    label: "Tutorial",
    template: {
      type: "tutorial",
      data: {
        sections: []
      }
    },
    multipleInstancesTemplate: {
      type: "tutorial",
      instances: [
        {
          sections: []
        }
      ]
    }
  },
  wordScramble: {
    label: "Word Scramble",
    template: {
      type: "wordScramble",
      data: {
        word: "",
        hint: "",
        category: ""
      }
    },
    multipleInstancesTemplate: {
      type: "wordScramble",
      instances: [
        {
          word: "",
          hint: "",
          category: ""
        }
      ]
    }
  },
  pictureWord: {
    label: "Picture Word",
    template: {
      type: "pictureWord",
      data: {
        images: [],
        correctWord: "",
        hints: []
      }
    },
    multipleInstancesTemplate: {
      type: "pictureWord",
      instances: [
        {
          images: [],
          correctWord: "",
          hints: []
        }
      ]
    }
  },
  crossword: {
    label: "Crossword",
    template: {
      type: "crossword",
      data: {
        grid: [],
        clues: {
          across: [],
          down: []
        }
      }
    },
    multipleInstancesTemplate: {
      type: "crossword",
      instances: [
        {
          grid: [],
          clues: {
            across: [],
            down: []
          }
        }
      ]
    }
  },
  quiz2: { // Added a second quiz entry to demonstrate the fix.  Remove this if only one quiz is intended.
    label: "Quiz",
    template: {
      type: "quiz",
      data: {
        questions: []
      }
    },
    multipleInstancesTemplate: {
      type: "quiz",
      instances: [
        {
          questions: []
        }
      ]
    }
  }
};


export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<GameModule | null>(null);
  const [selectedType, setSelectedType] = useState<string>("quiz");
  const [moduleToDelete, setModuleToDelete] = useState<GameModule | null>(null);

  const [useMultipleInstances, setUseMultipleInstances] = useState(false);

  const handleGameTypeChange = (value: string) => {
    const selectedType = value as keyof typeof gameTypes;
    setNewModule({
      ...newModule, 
      content: useMultipleInstances 
        ? gameTypes[selectedType]?.multipleInstancesTemplate || {} 
        : gameTypes[selectedType]?.template || {}
    });
  };

  const toggleMultipleInstances = () => {
    const newValue = !useMultipleInstances;
    setUseMultipleInstances(newValue);

    // Update content structure based on multiple instances setting
    if (newModule.content.type && gameTypes[newModule.content.type as keyof typeof gameTypes]) {
      setNewModule({
        ...newModule,
        content: newValue 
          ? gameTypes[newModule.content.type as keyof typeof gameTypes].multipleInstancesTemplate 
          : gameTypes[newModule.content.type as keyof typeof gameTypes].template
      });
    }
  };

  const [currentContentTemplate, setCurrentContentTemplate] = useState("");
  const [formData, setFormData] = useState({}); // Added formData state


  const { data: modules, isLoading } = useQuery<GameModule[]>({
    queryKey: ["/api/modules"],
  });

  const createModuleMutation = useMutation({
    mutationFn: async (formData: any) => {
      const payload = {
        title: formData.title,
        description: formData.description,
        ageGroup: formData.ageGroup,
        difficulty: formData.difficulty,
        content: {
          type: formData.type,
          data: formData.content
        }
      };
      return apiRequest("POST", "/api/modules", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      setCreateDialogOpen(false);
      toast.success("Module created successfully!");
    }
  });

  const updateModuleMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!selectedModule) return null;

      let parsedContent;
      try {
        parsedContent = typeof formData.content === 'string'
          ? JSON.parse(formData.content)
          : formData.content;

        const payload = {
          title: formData.title,
          description: formData.description,
          ageGroup: formData.ageGroup,
          difficulty: formData.difficulty,
          content: {
            type: formData.type || selectedModule.content.type,
            data: parsedContent
          }
        };
        return apiRequest("PUT", `/api/modules/${selectedModule.id}`, payload);
      } catch (error) {
        console.error("JSON parsing error:", error);
        throw new Error("Invalid JSON format in content field. Please check the format and try again.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      setEditDialogOpen(false);
      toast.success("Module updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(error?.message || "Failed to update module. Please check your input.");
    }
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/modules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      setDeleteDialogOpen(false);
      toast({ title: "Success", description: "Module deleted successfully!" });
    },
    onError: (err) => {
      toast({ title: "Error", description: "Failed to delete module: " + err.message, variant: "destructive" });
    }
  });


  const handleEdit = (module: GameModule) => {
    setSelectedModule(module);
    setSelectedType(module.content.type);

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

    setCurrentContentTemplate(JSON.stringify(module.content.data, null, 2));
    setEditDialogOpen(true);
  };

  const handleDelete = (module: GameModule) => {
    setModuleToDelete(module);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (moduleToDelete) {
      deleteModuleMutation.mutate(moduleToDelete.id);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    try {
      let parsedContent = {};
      try {
        parsedContent = JSON.parse(form.content.value);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        toast.error("Invalid JSON format. Please check your content template.");
        return;
      }

      const formData = {
        title: form.title.value,
        description: form.description.value,
        ageGroup: form.ageGroup.value,
        difficulty: form.difficulty.value,
        type: selectedType,
        content: parsedContent
      };

      createModuleMutation.mutate(formData);
    } catch (error) {
      toast.error("Failed to create module. Please try again.");
      console.error("Error creating module:", error);
    }
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // Validate content as JSON if it's a string
      let contentData;
      try {
        contentData = JSON.parse(data.content as string);

        // Basic validation for word scramble
        if (selectedType === "wordScramble" &&
            (!contentData.word || typeof contentData.word !== "string")) {
          toast({
            title: "Error",
            description: "Word Scramble content must include a 'word' field.",
            variant: "destructive",
          });
          return;
        }

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse content JSON. Please check the format.",
          variant: "destructive",
        });
        return;
      }

      updateModuleMutation.mutate(data);
    } catch (error) {
      toast.error("Failed to parse content JSON. Please check the format.");
      console.error("Error parsing content:", error);
    }
  };

  if (!user?.isAdmin) {
    return <div className="container py-8">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create New Game Module</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <Select defaultValue="all" name="ageGroup">
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                      <SelectItem value="teens">Teens</SelectItem>
                      <SelectItem value="adults">Adults</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select defaultValue="beginner" name="difficulty">
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Game Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    setCurrentContentTemplate(JSON.stringify(
                      gameTypes[value as keyof typeof gameTypes].template,
                      null,
                      2
                    ));
                  }}
                  name="type"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select game type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(gameTypes).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Game Content (JSON format)</Label>
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    onClick={() => {
                      // Fill template based on selected type
                      if (selectedType) {
                        const template = gameTypes[selectedType as keyof typeof gameTypes]?.template;
                        if (template) {
                          const textarea = document.getElementById('content') as HTMLTextAreaElement;
                          if (textarea) {
                            textarea.value = JSON.stringify(template, null, 2);
                          }
                        }
                      }
                    }}
                  >
                    Fill Template
                  </button>
                  <a
                    href="/admin/guide"
                    target="_blank"
                    className="text-sm text-blue-500 hover:underline cursor-pointer"
                  >
                    View Format Guide
                  </a>
                </div>
                <Textarea
                  id="content"
                  name="content"
                  placeholder={`Example: ${JSON.stringify(
                    selectedType && gameTypes[selectedType as keyof typeof gameTypes]?.template || {},
                    null,
                    2
                  )}`}
                  className="font-mono"
                  rows={10}
                  required
                />

                {selectedType && (
                  <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm">
                    <h4 className="font-semibold mb-1">Format Guide for {gameTypes[selectedType as keyof typeof gameTypes]?.label}</h4>
                    {selectedType === "quiz" && (
                      <p>Include an array of questions, each with options and correctAnswer index (0-based).</p>
                    )}
                    {selectedType === "crossword" && (
                      <p>Define a grid with letters and empty spaces, along with clues for across and down words.</p>
                    )}
                    {selectedType === "pictureWord" && (
                      <p>Provide an array of image paths, the correct word to spell, and optional hints.</p>
                    )}
                    {selectedType === "wordScramble" && (
                      <p>Include the word to scramble, a hint for players, and category for the word.</p>
                    )}
                    {selectedType === "tutorial" && (
                      <p>Create sections with titles, content text, and optional type identifiers.</p>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createModuleMutation.isPending}
              >
                {createModuleMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Game Module
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Game Module</DialogTitle>
          </DialogHeader>
          {selectedModule && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  defaultValue={selectedModule.title}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={selectedModule.description}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <Select defaultValue={selectedModule.ageGroup} name="ageGroup">
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                      <SelectItem value="teens">Teens</SelectItem>
                      <SelectItem value="adults">Adults</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select defaultValue={selectedModule.difficulty} name="difficulty">
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Game Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    setCurrentContentTemplate(JSON.stringify(gameTypes[value as keyof typeof gameTypes].template, null, 2));
                  }}
                  name="type"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select game type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(gameTypes).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <Label htmlFor="content">Game Content (JSON format)</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-sm text-blue-500 hover:underline cursor-pointer"
                    onClick={() => {
                      // Fill template based on selected type
                      if (selectedType) {
                        const template = gameTypes[selectedType as keyof typeof gameTypes]?.template;
                        if (template) {
                          // Set template and update content
                          setCurrentContentTemplate(JSON.stringify(template, null, 2));

                          // Also update the form data
                          setFormData(prev => ({
                            ...prev,
                            content: {
                              type: selectedType,
                              data: template
                            }
                          }));
                        }
                      }
                    }}
                  >
                    Fill Template
                  </button>
                  <a
                    className="text-sm text-blue-500 hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = '/admin/guide';
                    }}
                  >
                    View Format Guide
                  </a>
                </div>
              </div>
              <Textarea
                id="content"
                name="content"
                placeholder="Enter game content in JSON format"
                className="font-mono"
                rows={10}
                required
                value={currentContentTemplate}
                onChange={(e) => setCurrentContentTemplate(e.target.value)}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={updateModuleMutation.isPending}
              >
                {updateModuleMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Game Module
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules">Game Modules</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="modules" className="py-4">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules?.map((module) => (
                <Card key={module.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {module.description}
                    </p>
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Type: {gameTypes[module.content.type as keyof typeof gameTypes]?.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Age Group: {module.ageGroup}</span>
                        <span className="text-sm">Difficulty: {module.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEdit(module)}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Edit Module
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(module)}
                        disabled={deleteModuleMutation.isPending}
                      >
                        {deleteModuleMutation.isPending && module.id === deleteModuleMutation.variables ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete Module
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </div>
        </TabsContent>
        <TabsContent value="stats" className="py-4">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">User Statistics</h3>
            <p>Statistics dashboard coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete "{moduleToDelete?.title}"?</p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteModuleMutation.isPending}
            >
              {deleteModuleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}