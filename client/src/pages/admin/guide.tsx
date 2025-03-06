
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminGuide() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Game Content Format Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            This guide explains how to properly format content for different game types in the Fire Safety Education Platform.
          </p>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Quiz Format</h3>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
{`{
  "questions": [
    {
      "question": "What should you do if your clothes catch fire?",
      "options": ["Run outside", "Stop, drop, and roll", "Jump in water", "Call 911"],
      "correctAnswer": 1
    },
    {
      "question": "What is the emergency number to call in case of fire?",
      "options": ["999", "911", "112", "All of the above"],
      "correctAnswer": 3
    }
  ]
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Picture Word Format</h3>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
{`{
  "images": [
    "/images/extinguisher.jpg",
    "/images/smoke-detector.jpg", 
    "/images/fire-blanket.jpg",
    "/images/exit-sign.jpg"
  ],
  "correctWord": "SAFETY",
  "hints": ["Equipment that helps in emergencies"]
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Crossword Format</h3>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
{`{
  "grid": [
    ["F", "I", "R", "E", ""],
    ["", "", "", "X", ""],
    ["", "S", "A", "I", "T"],
    ["", "", "", "T", ""]
  ],
  "clues": {
    "across": [
      {
        "number": 1,
        "clue": "The thing that's hot and burns",
        "answer": "FIRE"
      },
      {
        "number": 3,
        "clue": "Another word for 'exit'",
        "answer": "EXIT"
      }
    ],
    "down": [
      {
        "number": 2,
        "clue": "When you need to get out quickly, you need to...",
        "answer": "ESCAPE"
      }
    ]
  }
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Word Scramble Format</h3>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
{`{
  "word": "ESCAPE",
  "hint": "What you need to do in case of fire",
  "category": "Safety Actions"
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Tutorial Format</h3>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
{`{
  "sections": [
    {
      "title": "Welcome to Fire Safety Training",
      "content": "This interactive tutorial will guide you through essential fire safety concepts.",
      "type": "introduction"
    },
    {
      "title": "Navigation Guide",
      "content": "Learn how to use the platform's features and track your progress.",
      "type": "walkthrough",
      "steps": [
        {
          "title": "Your Dashboard",
          "description": "View your progress, achievements, and daily challenges here.",
          "target": ".dashboard-stats"
        },
        {
          "title": "Game Modules",
          "description": "Access different types of learning activities and games.",
          "target": ".game-modules"
        }
      ]
    }
  ]
}`}
            </pre>
          </div>

          <div className="p-4 bg-blue-50 rounded-md">
            <p className="text-blue-800 font-medium">Important Notes:</p>
            <ul className="list-disc list-inside text-blue-700 mt-2">
              <li>Make sure to use valid JSON format</li>
              <li>All property names should be in quotes</li>
              <li>Array indices start at 0 for correct answers</li>
              <li>Double-check your content before saving</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
