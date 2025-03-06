# APULA Fire Safety Education Platform

An interactive fire safety education platform with gamified learning experiences, designed for all age groups.

## Features
- Interactive games (Crossword, 4 Pics 1 Word, Word Scramble)
- Age-appropriate content filtering
- Progress tracking and achievements
- Sound effects and animations
- Admin dashboard for content management

## Prerequisites
- Node.js v20 or later
- npm (comes with Node.js)

## Installation

1. Clone or download this repository:
```bash
git clone [repository-url]
cd apula-fire-safety
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
SESSION_SECRET=your_random_string_here
```

4. Start the development server:
```bash
npm run dev
```

5. Access the application:
- Open http://localhost:5000 in your browser
- Default admin credentials:
  - Username: admin
  - Password: admin

## Project Structure
```
/apula-fire-safety
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── index.html
├── server/
│   ├── auth.ts
│   ├── index.ts
│   ├── routes.ts
│   └── storage.ts
├── shared/
│   └── schema.ts
├── public/
│   └── sounds/
│       ├── correct.mp3
│       ├── wrong.mp3
│       ├── level-up.mp3
│       ├── achievement.mp3
│       └── click.mp3
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env
```

## Available Games
1. Quiz Games
   - Multiple choice questions
   - Immediate feedback
   - Score tracking

2. Crossword Puzzles
   - Fire safety themed
   - Interactive grid
   - Clue system

3. 4 Pics 1 Word
   - Fire safety related images
   - Word guessing
   - Hint system

4. Word Scramble
   - Safety-related vocabulary
   - Different difficulty levels
   - Category-based words

## Tech Stack
- React.js with TypeScript
- Vite for building
- Express.js backend
- TanStack Query for data fetching
- Framer Motion for animations
- Tailwind CSS for styling

## Troubleshooting

1. Port already in use:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

2. Dependencies issues:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Contributing
Feel free to submit issues and enhancement requests.
