import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { GameModule } from "@shared/schema";
import { GameModuleFormDialog } from "@/components/admin/game-module-form-dialog";

export default function GameModules() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: modules, isLoading } = useQuery<GameModule[]>({
    queryKey: ["/api/admin/modules"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/modules", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Game module created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/modules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      toast({
        title: "Success",
        description: "Game module deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user?.isAdmin) {
    return <div>Access Denied</div>;
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this module?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Game Modules</h1>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Module
            </Button>
          </div>

          <GameModuleFormDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSubmit={createMutation.mutate}
            isSubmitting={createMutation.isPending}
          />

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="divide-y">
                  {modules?.map((module) => (
                    <div
                      key={module.id}
                      className="py-4 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-medium">{module.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Type: {module.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(module.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {modules?.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">
                      No game modules yet. Click "Add New Module" to create one.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}