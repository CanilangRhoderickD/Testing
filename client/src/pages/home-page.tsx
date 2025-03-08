import { useAuth } from "@/hooks/use-auth";
import { GameCard } from "@/components/games/game-card";
import { Sidebar } from "@/components/layout/sidebar";
import { Link } from "@/components/link";

export default function HomePage() {
  const { user } = useAuth();

  const games = [
    {
      title: "Fire Safety Crossword",
      description: "Test your knowledge of fire safety terms and concepts",
      path: "/games/crossword",
      icon: "puzzle",
    },
    {
      title: "4 Pics 1 Word",
      description: "Identify fire safety equipment and scenarios",
      path: "/games/four-pics",
      icon: "images",
    },
    {
      title: "Word Scramble",
      description: "Unscramble fire safety related words",
      path: "/games/word-scramble",
      icon: "shuffle",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Welcome, {user?.username}!</h1>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-card p-4 rounded-lg">
                <div className="text-3xl font-bold">{user?.points}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
              <div className="bg-card p-4 rounded-lg">
                <div className="text-3xl font-bold">Level {user?.level}</div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </div>
              {user?.role === "admin" && (
                <div className="bg-card p-4 rounded-lg">
                  <Link to="/admin" className="text-3xl font-bold">Admin Panel</Link>
                  <div className="text-sm text-muted-foreground">Manage site settings and content</div>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Available Games</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <div key={game.id || game.path}>
                <Link href={`/game/${game.id}`}>
                  <GameCard title={game.title} description={game.description} path={game.path} icon={game.icon || "puzzle"} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}