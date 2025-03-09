
import React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string | number;
  name: string;
  status: 'complete' | 'current' | 'upcoming';
}

interface ProgressStepsProps {
  steps: Step[];
  className?: string;
}

export function ProgressSteps({ steps, className }: ProgressStepsProps) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="md:flex-1">
            <div
              className={cn(
                "flex flex-col border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                stepIdx !== steps.length - 1 ? "pb-4" : "",
                step.status === "complete" ? "border-primary" : "border-border"
              )}
            >
              <span className="flex items-center md:flex-col md:items-start text-sm font-medium">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    {
                      "bg-primary text-primary-foreground": step.status === "complete",
                      "bg-primary/20 text-primary": step.status === "current",
                      "bg-muted text-muted-foreground": step.status === "upcoming",
                    }
                  )}
                >
                  {step.status === "complete" ? (
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span>{stepIdx + 1}</span>
                  )}
                </span>
                <span
                  className={cn("ml-3 md:ml-0 md:mt-2", {
                    "text-foreground font-semibold": step.status === "current",
                    "text-muted-foreground": step.status !== "current",
                  })}
                >
                  {step.name}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
