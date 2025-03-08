
import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About APULA</h1>
            <p className="text-lg text-muted-foreground">
              A Web-Based Application to Educate and Empower Residents in Fire Prevention Through Engaging Games
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-card rounded-lg p-8 shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                APULA is dedicated to improving fire safety awareness through interactive educational games. 
                Our mission is to empower individuals with the knowledge and skills needed to prevent and respond to fire incidents.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 shadow-md">
              <h2 className="text-2xl font-semibold mb-4">The Problem</h2>
              <p className="text-muted-foreground mb-4">
                Fire incidents continue to pose significant threats to communities worldwide, often resulting from preventable causes. 
                A lack of accessible and engaging fire safety education contributes to this ongoing issue.
              </p>
              <p className="text-muted-foreground">
                Traditional fire safety training can be dull and unmemorable, leading to poor retention of critical information when it matters most.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Our Solution</h2>
              <p className="text-muted-foreground">
                APULA transforms fire safety education through gamification, making learning engaging and memorable.
                Our platform features a variety of games designed to teach essential fire prevention concepts while tracking progress and rewarding achievement.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
