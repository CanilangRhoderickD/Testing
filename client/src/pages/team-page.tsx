import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/sidebar';

export default function TeamPage() {
  return (
    <div className="min-h-screen">
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Team</h1>
            <p className="text-lg text-muted-foreground">
              Meet the developers behind APULA: A Web-Based Application to Educate and 
              Empower Residents in Fire Prevention Through Engaging Games
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Team Member 1 */}
            <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-muted rounded-full mb-4 flex items-center justify-center overflow-hidden">
                  <span className="text-4xl">👩‍💻</span>
                </div>
                <h3 className="text-xl font-bold">Jeverly Ruth Amoy Cabinto</h3>
                <p className="text-muted-foreground mt-2 text-center">Lead Developer</p>
                <p className="mt-4 text-center">Frontend & game mechanics specialist with a passion for creating engaging user experiences.</p>
              </div>
            </div>
            
            {/* Team Member 2 */}
            <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-muted rounded-full mb-4 flex items-center justify-center overflow-hidden">
                  <span className="text-4xl">👨‍💻</span>
                </div>
                <h3 className="text-xl font-bold">Harry Ann Marielle Aljas Fagel</h3>
                <p className="text-muted-foreground mt-2 text-center">Backend Developer</p>
                <p className="mt-4 text-center">Database architecture and server-side logic expert focused on system reliability and performance.</p>
              </div>
            </div>
            
            {/* Team Member 3 */}
            <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-muted rounded-full mb-4 flex items-center justify-center overflow-hidden">
                  <span className="text-4xl">👩‍💻</span>
                </div>
                <h3 className="text-xl font-bold">Fiarrah Mae Palaci Ulat</h3>
                <p className="text-muted-foreground mt-2 text-center">UI/UX Designer</p>
                <p className="mt-4 text-center">Creative designer with a focus on intuitive interfaces and accessible educational content.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-8 shadow-md mb-12">
            <h2 className="text-2xl font-bold mb-4">About the Project</h2>
            <p className="mb-4">
              APULA is a web-based application designed to educate and empower residents in fire prevention through engaging games. 
              Our mission is to increase awareness about fire safety measures and procedures in an interactive way that 
              makes learning both effective and enjoyable.
            </p>
            <p className="mb-4">
              Through various game modules like word scrambles, crosswords, and visual puzzles, users can learn 
              essential fire safety concepts while tracking their progress and earning achievements.
            </p>
            <h3 className="text-xl font-bold mt-6 mb-2">Key Features:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Interactive gameplay that teaches fire prevention concepts</li>
              <li>Achievement system to track and reward learning progress</li>
              <li>Easy-to-use admin dashboard for content management</li>
              <li>Responsive design for desktop and mobile use</li>
              <li>User-friendly interface designed for all age groups</li>
            </ul>
          </div>
          
          <div className="text-center">
            <Link href="/">
              <Button size="lg" className="animate-pulse">
                Start Playing & Learning Now
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
