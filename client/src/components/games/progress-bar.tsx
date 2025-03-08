import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full">
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between mt-1 text-sm text-muted-foreground">
        <span>{value} points</span>
        <span>{max} points needed</span>
      </div>
    </div>
  );
}
