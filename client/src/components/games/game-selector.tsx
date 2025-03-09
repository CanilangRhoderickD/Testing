
import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
}

interface GameSelectorProps {
  games: Game[];
}

export function GameSelector({ games }: GameSelectorProps) {
  return (
    <div className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {games.map((game, index) => (
          <Link key={game.id} href={`/games/${game.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <Card className={`overflow-hidden border-2 ${game.bgColor} h-full`}>
                <div className="p-6 flex flex-col items-center text-center h-full">
                  <div className="text-5xl mb-4">{game.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground text-sm">{game.description}</p>
                  </CardContent>
                  <div className="mt-auto pt-4">
                    <span className="text-primary font-medium">Start Learning →</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
