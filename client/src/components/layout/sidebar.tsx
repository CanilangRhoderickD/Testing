import React from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Home,
  LogOut,
  Medal,
  Settings,
  Users
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user, isPending, logout } = useAuth();

  const navItems = [
    { label: "Home", icon: <Home className="h-5 w-5 mr-2" />, href: "/dashboard" },
    { label: "Games", icon: <BookOpen className="h-5 w-5 mr-2" />, href: "/games" },
    { label: "Achievements", icon: <Medal className="h-5 w-5 mr-2" />, href: "/achievements" },
    { label: "Team", icon: <Users className="h-5 w-5 mr-2" />, href: "/team" },
  ];

  const adminItems = [
    { label: "Dashboard", icon: <Settings className="h-5 w-5 mr-2" />, href: "/admin" },
    { label: "Game Modules", icon: <BookOpen className="h-5 w-5 mr-2" />, href: "/admin/modules" },
    { label: "Achievements", icon: <Medal className="h-5 w-5 mr-2" />, href: "/admin/achievements" },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">APULA</h1>
        <p className="text-xs text-gray-400">Fire Safety Education</p>
      </div>

      <nav className="flex-1 p-4">
        <div className="mb-6">
          <p className="text-xs uppercase text-gray-500 mb-2">Navigation</p>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>
                  <span className="flex items-center p-2 rounded hover:bg-gray-800 cursor-pointer">
                    {item.icon}
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {user && user.isAdmin && (
          <div className="mb-6">
            <p className="text-xs uppercase text-gray-500 mb-2">Admin</p>
            <ul className="space-y-2">
              {adminItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}>
                    <span className="flex items-center p-2 rounded hover:bg-gray-800 cursor-pointer">
                      {item.icon}
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full flex items-center justify-start text-white"
          disabled={isPending}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};