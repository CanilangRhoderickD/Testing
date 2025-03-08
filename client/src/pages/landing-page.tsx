
import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowDown, Shield, Flame, Award, Dices } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Flame className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl">APULA</span>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/team" className="text-foreground hover:text-primary transition-colors">
              Our Team
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Link href="/auth">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Learn Fire Prevention<br />Through Engaging Games
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            APULA is a web-based application designed to educate and empower residents 
            in fire prevention through interactive and fun gameplay.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/auth?tab=register">
              <Button size="lg" className="group">
                Get Started 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="group">
                Learn More
                <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How APULA Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Dices className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fun Games</h3>
              <p className="text-muted-foreground">
                Learn through word scrambles, crosswords, and visual puzzles specifically designed to teach fire safety concepts.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fire Prevention</h3>
              <p className="text-muted-foreground">
                Master essential fire safety knowledge that could save lives and protect property in real-world situations.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Earn achievements, level up, and monitor your learning progress as you become a fire safety expert.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join APULA today and become empowered with the knowledge to prevent and respond to fire incidents.
          </p>
          <Link href="/auth?tab=register">
            <Button size="lg">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Flame className="h-5 w-5 text-primary mr-2" />
              <span className="font-bold">APULA</span>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Our Team
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-6">
            © {new Date().getFullYear()} APULA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
