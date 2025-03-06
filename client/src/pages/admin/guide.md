
# Game Content JSON Guide

## How to Format Game Content for Different Game Types

### Quiz Format
```json
{
  "questions": [
    {
      "text": "What should you do if your clothes catch fire?",
      "options": ["Run", "Stop, drop, and roll", "Jump in water", "Call for help"],
      "correctAnswer": 1
    },
    {
      "text": "What is the emergency number to call in case of fire?",
      "options": ["911", "112", "999", "All of the above"],
      "correctAnswer": 3
    }
  ]
}
```

### Word Scramble Format
```json
{
  "word": "ESCAPE",
  "hint": "What you need to do in case of fire",
  "category": "Safety Actions"
}
```

### Picture Word Format
```json
{
  "images": [
    "/images/extinguisher.jpg",
    "/images/smoke-detector.jpg",
    "/images/fire-blanket.jpg",
    "/images/exit-sign.jpg"
  ],
  "correctWord": "SAFETY",
  "hints": ["Equipment that helps in emergencies"]
}
```

### Crossword Format
```json
{
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
}
```

Note: When editing game modules, make sure to paste valid JSON into the content field based on the selected game type.


# Game Content Format Guide

This guide explains how to properly format content for different game types in the Fire Safety Education Platform.

## Quiz

```json
{
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
}
```

## Crossword

```json
{
  "grid": [
    ["*", "*", "*", "*", "*"],
    ["*", "F", "I", "R", "E"],
    ["*", "S", "*", "O", "*"],
    ["*", "A", "L", "A", "R", "M"],
    ["*", "*", "*", "*", "*"]
  ],
  "clues": {
    "across": [
      {
        "number": 1,
        "clue": "What produces heat and light",
        "answer": "FIRE"
      },
      {
        "number": 2,
        "clue": "Device that makes noise in emergency",
        "answer": "ALARM"
      }
    ],
    "down": [
      {
        "number": 1,
        "clue": "Being protected from danger",
        "answer": "SAFE"
      }
    ]
  }
}
```

## Picture Word

```json
{
  "images": [
    "/images/extinguisher.jpg",
    "/images/smoke-detector.jpg",
    "/images/fire-blanket.jpg",
    "/images/exit-sign.jpg"
  ],
  "correctWord": "SAFETY",
  "hints": ["Equipment that helps in emergencies"]
}
```

## Word Scramble

```json
{
  "word": "ESCAPE",
  "hint": "What you need to do in case of fire",
  "category": "Safety Actions"
}
```

## Tutorial

```json
{
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
          "description": "View your progress, achievements, and daily challenges here."
        },
        {
          "title": "Game Modules",
          "description": "Access different types of learning activities and games."
        }
      ]
    }
  ]
}
```

## Important Notes:

1. Always use valid JSON format (keys in double quotes, proper commas)
2. Make sure the structure matches the expected format for each game type
3. The content must be a valid JSON object that will be stored in the `data` field
4. Test your content in a JSON validator if you're unsure about the format
