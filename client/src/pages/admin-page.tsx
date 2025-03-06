
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    console.log("Admin page - Current user:", user);
    
    if (!isLoading) {
      if (!user) {
        // User is not logged in
        setLocation("/auth");
        return;
      }

      console.log("Admin check - Is admin?", user.isAdmin);
      if (!user.isAdmin) {
        // User is logged in but not an admin
        setLocation("/");
        return;
      }

      setPageLoading(false);
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="modules">
            <TabsList>
              <TabsTrigger value="modules">Game Modules</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="modules" className="py-4">
              <h3 className="text-lg font-medium mb-4">Manage Game Modules</h3>
              {/* Module management interface would go here */}
              <p>Module management features coming soon.</p>
            </TabsContent>
            <TabsContent value="users" className="py-4">
              <h3 className="text-lg font-medium mb-4">User Management</h3>
              {/* User management interface would go here */}
              <p>User management features coming soon.</p>
            </TabsContent>
            <TabsContent value="stats" className="py-4">
              <h3 className="text-lg font-medium mb-4">User Statistics</h3>
              {/* Statistics interface would go here */}
              <p>Statistics features coming soon.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
