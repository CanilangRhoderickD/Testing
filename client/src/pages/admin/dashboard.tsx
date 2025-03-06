import { useState } from "react";
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<GameModule | null>(null);
  const [selectedType, setSelectedType] = useState<string>("quiz");
  const toast = useToast();

  const { data: modules, isLoading } = useQuery<GameModule[]>({
    queryKey: ["/api/modules"],
  });

  const createModuleMutation = useMutation({
    mutationFn: async (formData: any) => {
      const parsedContent = JSON.parse(formData.content);
      const payload = {
        title: formData.title,
        description: formData.description,
        ageGroup: formData.ageGroup,
        difficulty: formData.difficulty,
        content: {
          type: formData.type,
          data: parsedContent
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
      const parsedContent = JSON.parse(formData.content);
      const payload = {
        id: formData.id,
        title: formData.title,
        description: formData.description,
        ageGroup: formData.ageGroup,
        difficulty: formData.difficulty,
        content: {
          type: formData.type,
          data: parsedContent
        }
      };
      return apiRequest("PUT", `/api/modules/${formData.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      setEditDialogOpen(false);
      toast.success("Module updated successfully!");
    }
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/modules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast.success("Module deleted successfully!");
    },
    onError: (err) => {
      toast.error("Failed to delete module: " + err.message);
    }
  });

  const gameTypes = {
    quiz: {
      label: "Quiz",
      template: {
        questions: [
          {
            question: "Sample question?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0
          }
        ]
      }
    },
    crossword: {
      label: "Crossword",
      template: {
        grid: [
          ["*", "*", "*", "*", "*"],
          ["*", "", "", "", "*"],
          ["*", "", "*", "", "*"],
          ["*", "", "", "", "*"],
          ["*", "*", "*", "*", "*"]
        ],
        words: ["fire", "safe"],
        clues: ["What to avoid", "How to be"]
      }
    },
    pictureWord: {
      label: "Picture Word",
      template: {
        images: ["/images/image1.jpg", "/images/image2.jpg"],
        correctWord: "SAFETY",
        hints: ["Equipment that helps in emergencies"]
      }
    },
    wordScramble: {
      label: "Word Scramble",
      template: {
        word: "ESCAPE",
        hint: "What you need to do in case of fire",
        category: "Safety Actions"
      }
    },
    tutorial: {
      label: "Tutorial",
      template: {
        sections: [
          {
            title: "Introduction",
            content: "This is the introduction to fire safety.",
            type: "introduction"
          }
        ]
      }
    }
  };

  const handleEdit = (module: GameModule) => {
    setSelectedModule(module);
    setSelectedType(module.content.type);
    setEditDialogOpen(true);
  };

  const handleDelete = (module: GameModule) => {
    if (confirm(`Are you sure you want to delete ${module.title}?`)) {
      deleteModuleMutation.mutate(module.id);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const formData = {
      title: form.title.value,
      description: form.description.value,
      ageGroup: form.ageGroup.value,
      difficulty: form.difficulty.value,
      type: selectedType,
      content: form.content.value
    };

    createModuleMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const formData = {
      id: selectedModule?.id,
      title: form.title.value,
      description: form.description.value,
      ageGroup: form.ageGroup.value,
      difficulty: form.difficulty.value,
      type: selectedType,
      content: form.content.value
    };

    updateModuleMutation.mutate(formData);
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
                  onValueChange={setSelectedType}
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
                <Textarea
                  id="content"
                  name="content"
                  placeholder={`Example: ${JSON.stringify(
                    gameTypes[selectedType as keyof typeof gameTypes].template,
                    null,
                    2
                  )}`}
                  className="font-mono"
                  rows={10}
                  required
                  defaultValue={JSON.stringify(
                    gameTypes[selectedType as keyof typeof gameTypes].template,
                    null,
                    2
                  )}
                />
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
                  onValueChange={setSelectedType}
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
                <Textarea
                  id="content"
                  name="content"
                  className="font-mono"
                  rows={10}
                  required
                  defaultValue={JSON.stringify(
                    selectedModule.content.data,
                    null,
                    2
                  )}
                />
              </div>

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
        </TabsContent>
        <TabsContent value="stats" className="py-4">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">User Statistics</h3>
            <p>Statistics dashboard coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}