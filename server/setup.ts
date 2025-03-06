import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function setupInitialData() {
  // Create admin user with hashed password
  await storage.createUser({
    username: "admin",
    password: await hashPassword("admin"),
    isAdmin: true
  });

  // Create sample game modules
  await storage.createGameModule({
    title: "Fire Safety Basics",
    description: "Learn about common fire hazards and prevention",
    ageGroup: "all",
    difficulty: "beginner",
    content: {
      type: "tutorial",
      data: {
        sections: [
          {
            title: "Welcome to Fire Safety Training",
            content: "This interactive tutorial will guide you through essential fire safety concepts.",
            type: "introduction"
          },
          {
            title: "Navigation Guide",
            content: "Learn how to use the platform's features and track your progress.",
            type: "walkthrough",
            steps: [
              {
                title: "Your Dashboard",
                description: "View your progress, achievements, and daily challenges here.",
                target: ".dashboard-stats"
              },
              {
                title: "Game Modules",
                description: "Access different types of learning activities and games.",
                target: ".game-modules"
              },
              {
                title: "Progress Tracking",
                description: "Monitor your level and completed achievements.",
                target: ".progress-section"
              }
            ]
          }
        ]
      }
    }
  });

  await storage.createGameModule({
    title: "Fire Safety Words",
    description: "Test your knowledge of fire safety terms",
    ageGroup: "kids",
    difficulty: "beginner",
    content: {
      type: "wordScramble",
      data: {
        word: "ESCAPE",
        hint: "What you need to do in case of fire",
        category: "Safety Actions"
      }
    }
  });

  await storage.createGameModule({
    title: "Safety Equipment",
    description: "Identify important fire safety equipment",
    ageGroup: "teens",
    difficulty: "intermediate",
    content: {
      type: "pictureWord",
      data: {
        images: [
          "/images/extinguisher.jpg",
          "/images/smoke-detector.jpg",
          "/images/fire-blanket.jpg",
          "/images/exit-sign.jpg"
        ],
        correctWord: "SAFETY",
        hints: ["Equipment that helps in emergencies"]
      }
    }
  });
}