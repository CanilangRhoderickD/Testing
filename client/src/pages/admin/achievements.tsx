
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader2, Plus, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Achievement, InsertAchievement } from '@shared/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AchievementCard } from '@/components/achievements/achievement-card';
import { insertAchievementSchema } from '@shared/schema';

export default function AdminAchievementsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertAchievement>>({
    name: '',
    description: '',
    type: 'level',
    requirement: 1,
    badgeUrl: 'https://api.dicebear.com/6.x/shapes/svg?seed=achievement'
  });

  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  const createAchievement = useMutation({
    mutationFn: async (data: InsertAchievement) => {
      const response = await fetch('/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create achievement');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      setIsOpen(false);
      setFormData({
        name: '',
        description: '',
        type: 'level',
        requirement: 1,
        badgeUrl: 'https://api.dicebear.com/6.x/shapes/svg?seed=achievement'
      });
    },
  });

  if (!user?.isAdmin) {
    return <div>Access Denied</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = insertAchievementSchema.parse(formData);
      createAchievement.mutate(validatedData);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Achievements</h1>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Achievement</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      id="description" 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="level">Level Based</SelectItem>
                        <SelectItem value="score">Score Based</SelectItem>
                        <SelectItem value="completion">Completion Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="requirement">Requirement</Label>
                    <Input 
                      id="requirement" 
                      type="number" 
                      min="1"
                      value={formData.requirement} 
                      onChange={(e) => setFormData({...formData, requirement: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="badgeUrl">Badge URL</Label>
                    <Input 
                      id="badgeUrl" 
                      value={formData.badgeUrl} 
                      onChange={(e) => setFormData({...formData, badgeUrl: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={createAchievement.isPending}>
                    {createAchievement.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Achievement
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements?.map(achievement => (
            <div key={achievement.id} className="relative group">
              <AchievementCard achievement={achievement} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
