
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface QuizProps {
  data: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
  onComplete: (score: number) => void;
}

export function Quiz({ data, onComplete }: QuizProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleOptionSelect = (index: number) => {
    if (!isSubmitted) {
      setSelectedOption(index);
    }
  };
  
  const handleSubmit = () => {
    if (selectedOption !== null) {
      setIsSubmitted(true);
      const score = selectedOption === data.correctAnswer ? 100 : 0;
      setTimeout(() => onComplete(score), 1500);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Quiz Question</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-xl font-medium text-center mb-6">{data.question}</div>
        
        <div className="space-y-3">
          {data.options.map((option, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedOption === index 
                  ? isSubmitted 
                    ? index === data.correctAnswer 
                      ? "bg-green-100 border-green-400" 
                      : "bg-red-100 border-red-400"
                    : "bg-blue-100 border-blue-400"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleOptionSelect(index)}
            >
              {option}
              {isSubmitted && index === data.correctAnswer && (
                <span className="ml-2 text-green-600">✓</span>
              )}
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={selectedOption === null || isSubmitted}
          className="w-full mt-4"
        >
          {isSubmitted ? "Submitted" : "Submit Answer"}
        </Button>
      </CardContent>
    </Card>
  );
}
