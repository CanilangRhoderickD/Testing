import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Puzzle, Images, Shuffle } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  path: string;
  icon: string;
}

const iconMap = {
  puzzle: Puzzle,
  images: Images,
  shuffle: Shuffle,
};

export function GameCard({ title, description, path, icon }: GameCardProps) {
  const Icon = iconMap[icon as keyof typeof iconMap];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Icon className="h-6 w-6" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Link href={path}>
          <Button className="w-full">Play Now</Button>
        </Link>
      </CardContent>
    </Card>
  );
}