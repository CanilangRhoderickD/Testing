import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreatorProfile {
  name: string;
  role: string;
  imageUrl: string;
}

export default function ProfileCard({ name, role, imageUrl }: CreatorProfile) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-square relative">
          <Avatar className="h-full w-full rounded-none">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback className="rounded-none text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent className="p-4 text-center">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground">{role}</p>
      </CardContent>
    </Card>
  );
}
