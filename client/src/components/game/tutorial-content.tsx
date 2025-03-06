
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface TutorialStep {
  title: string;
  description: string;
}

interface TutorialSection {
  title: string;
  content: string;
  type: string;
  steps?: TutorialStep[];
}

interface TutorialContentProps {
  data: {
    sections: TutorialSection[];
  };
  onComplete: () => void;
}

export function TutorialContent({ data, onComplete }: TutorialContentProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  if (!data || !data.sections || !Array.isArray(data.sections)) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-red-500">This tutorial content is not properly formatted.</p>
        <p>Required format: JSON with a 'sections' array containing section objects.</p>
      </div>
    );
  }

  const currentSection = data.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === data.sections.length - 1;
  const hasSteps = currentSection.steps && Array.isArray(currentSection.steps) && currentSection.steps.length > 0;
  const currentStep = hasSteps ? currentSection.steps![currentStepIndex] : null;
  const isLastStep = hasSteps ? currentStepIndex === currentSection.steps!.length - 1 : true;

  const handleNext = () => {
    if (hasSteps && !isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (!isLastSection) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentStepIndex(0);
    } else {
      onComplete();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{currentSection.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose max-w-none">
          <p>{currentSection.content}</p>
        </div>
        
        {hasSteps && (
          <div className="mt-6 border rounded-lg p-4 bg-muted/20">
            <h3 className="text-lg font-medium mb-2">{currentStep?.title}</h3>
            <p>{currentStep?.description}</p>
          </div>
        )}

        {hasSteps && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {currentSection.steps!.length}
            </span>
            <div className="flex gap-1">
              {currentSection.steps!.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === currentStepIndex ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStepIndex > 0) {
              setCurrentStepIndex(currentStepIndex - 1);
            } else if (currentSectionIndex > 0) {
              setCurrentSectionIndex(currentSectionIndex - 1);
              const prevSection = data.sections[currentSectionIndex - 1];
              if (prevSection.steps && prevSection.steps.length > 0) {
                setCurrentStepIndex(prevSection.steps.length - 1);
              } else {
                setCurrentStepIndex(0);
              }
            }
          }}
          disabled={currentSectionIndex === 0 && currentStepIndex === 0}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {isLastSection && isLastStep ? "Complete" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  );
}
