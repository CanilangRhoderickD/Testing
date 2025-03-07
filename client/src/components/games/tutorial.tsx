import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface TutorialSection {
  title: string;
  content: string;
  type: string;
  steps?: {
    title: string;
    description: string;
    target: string;
  }[];
}

interface TutorialProps {
  data: {
    sections: TutorialSection[];
  };
}

export function Tutorial({ data }: TutorialProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const totalSections = data.sections.length;
  const currentSection = data.sections[currentSectionIndex];

  const hasSteps = currentSection.steps && currentSection.steps.length > 0;
  const totalSteps = hasSteps ? currentSection.steps!.length : 0;
  const currentStep = hasSteps ? currentSection.steps![currentStepIndex] : null;

  const goToNextSection = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentStepIndex(0);
    }
  };

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentStepIndex(0);
    }
  };

  const goToNextStep = () => {
    if (hasSteps && currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      goToNextSection();
    }
  };

  const goToPrevStep = () => {
    if (hasSteps && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      goToPrevSection();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{currentSection.title}</CardTitle>
        {totalSections > 1 && (
          <p className="text-sm text-gray-500">
            Section {currentSectionIndex + 1} of {totalSections}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {!hasSteps ? (
          <div className="prose max-w-none">
            <p>{currentSection.content}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p>{currentSection.content}</p>
            </div>

            <div className="border p-4 rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">{currentStep?.title}</h3>
              <p>{currentStep?.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                Element: <code>{currentStep?.target}</code>
              </div>
              {totalSteps > 1 && (
                <p className="text-xs text-gray-500 mt-2">
                  Step {currentStepIndex + 1} of {totalSteps}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={hasSteps ? goToPrevStep : goToPrevSection}
          disabled={currentSectionIndex === 0 && (!hasSteps || currentStepIndex === 0)}
        >
          Previous
        </Button>

        <Button 
          onClick={hasSteps ? goToNextStep : goToNextSection}
          disabled={currentSectionIndex === totalSections - 1 && (!hasSteps || currentStepIndex === totalSteps - 1)}
        >
          {currentSectionIndex === totalSections - 1 && (!hasSteps || currentStepIndex === totalSteps - 1) 
            ? "Finish" 
            : "Next"}
        </Button>
      </CardFooter>
    </Card>
  );
}