import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-bold cursor-pointer">APULA</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="gap-4">
            {user ? (
              <>
                <NavigationMenuItem>
                  <Link href="/game">
                    <span className="text-sm font-medium cursor-pointer">Play Game</span>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/dashboard">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">Dashboard</span>
                      {user.progress && (
                        <Badge variant="secondary" className="ml-1">
                          Level {user.progress.currentLevel}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </NavigationMenuItem>
                {user.isAdmin && (
                  <NavigationMenuItem>
                    <Link href="/admin">
                      <span className="text-sm font-medium cursor-pointer">Admin</span>
                    </Link>
                  </NavigationMenuItem>
                )}
                <NavigationMenuItem>
                  <Button
                    variant="outline"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    Logout
                  </Button>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuItem>
                <Link href="/auth">
                  <Button asChild>
                    <span>Login</span>
                  </Button>
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}