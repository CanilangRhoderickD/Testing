import { GameModule } from "@shared/schema";

/**
 * Determine if a game module has multiple instances that require navigation
 */
export function hasMultipleInstances(module: GameModule | null): boolean {
  if (!module || !module.content) return false;
  
  // Modules that typically have multiple sections/instances
  switch (module.content.type) {
    case "tutorial":
      return module.content.data?.sections && 
             Array.isArray(module.content.data.sections) && 
             module.content.data.sections.length > 1;
    case "quiz":
      return module.content.data?.questions && 
             Array.isArray(module.content.data.questions) && 
             module.content.data.questions.length > 1;
    default:
      return false;
  }
}

/**
 * Calculate points awarded for completing a specific game module
 */
export function calculatePoints(module: GameModule | null, timeSpent: number): number {
  if (!module) return 0;
  
  // Base points by difficulty
  let points = 0;
  switch (module.difficulty) {
    case "beginner": points = 50; break;
    case "intermediate": points = 100; break;
    case "advanced": points = 150; break;
    default: points = 50;
  }
  
  // Time bonus - faster completion gets more points
  // (up to a reasonable minimum time to prevent cheating)
  const minTimeInSeconds = 30;
  const maxTimeInSeconds = 300; // 5 minutes
  
  if (timeSpent >= minTimeInSeconds && timeSpent <= maxTimeInSeconds) {
    const timeBonus = Math.floor((1 - (timeSpent - minTimeInSeconds) / 
                                 (maxTimeInSeconds - minTimeInSeconds)) * 50);
    points += timeBonus;
  }
  
  return points;
}

/**
 * Format time in seconds to a readable format (mm:ss)
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

/**
 * Scramble a word by randomly rearranging its letters
 */
export function scrambleWord(word: string): string {
  // Convert to array, shuffle, and join back
  const letters = word.split('');
  
  // Fisher-Yates shuffle algorithm
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  
  // Make sure the scrambled word is different from the original
  const scrambled = letters.join('');
  if (scrambled === word && word.length > 1) {
    // If still the same, swap the first two letters
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  
  return letters.join('').toUpperCase();
}