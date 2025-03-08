
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export default function AdminModuleDetails() {
  const [, params] = useRoute('/admin/modules/:id');
  const moduleId = params?.id ? parseInt(params.id) : null;

  const { data: module, isLoading } = useQuery({
    queryKey: ['/api/modules', moduleId],
    enabled: !!moduleId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Link href="/admin/modules">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Modules
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Module Not Found</h1>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p>The requested module was not found. It may have been deleted or the ID is invalid.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/admin/modules">
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Modules
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{module.name}</h1>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <h3 className="font-semibold">Type</h3>
                    <p className="capitalize">{module.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Description</h3>
                    <p>{module.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Difficulty</h3>
                    <p>{module.difficulty} / 5</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">XP Reward</h3>
                    <p>{module.xpReward} XP</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Status</h3>
                    <p>{module.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto">
                  {JSON.stringify(module.content, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
