
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizGameProps {
  data: {
    questions: QuizQuestion[];
  };
  onComplete?: (score: number) => void;
}

export function QuizGame({ data }: QuizGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const correct = optionIndex === data.questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  if (!data.questions || data.questions.length === 0) {
    return <div>No questions available for this quiz.</div>;
  }

  if (showResults) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-2xl font-bold mb-4">
            Your score: {score} / {data.questions.length}
          </p>
          <Button onClick={handleRestart}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  const question = data.questions[currentQuestion];

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Question {currentQuestion + 1} of {data.questions.length}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-4">{question.question}</p>
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedOption === index 
                ? (isCorrect ? "success" : "destructive") 
                : "outline"}
              className="w-full justify-start text-left"
              onClick={() => handleAnswer(index)}
              disabled={selectedOption !== null}
            >
              {option}
            </Button>
          ))}
        </div>
        {selectedOption !== null && (
          <div className="mt-4 text-center">
            <p className={isCorrect ? "text-green-600" : "text-red-600"}>
              {isCorrect ? "Correct!" : "Incorrect!"}
            </p>
            <Button className="mt-2" onClick={handleNext}>
              {currentQuestion < data.questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
