import React from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, Cpu, GraduationCap } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="h-14 border-b border-border flex items-center px-4 justify-between shrink-0 bg-card/50 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Cpu className="w-5 h-5" />
            <span className="font-mono font-bold tracking-tight">PATHFORGE</span>
          </Link>
          <nav className="flex items-center gap-1 ml-6 text-sm font-mono text-muted-foreground">
            <Link 
              href="/" 
              className={`px-3 py-1.5 rounded transition-colors hover:text-foreground ${location === '/' ? 'bg-secondary text-foreground' : ''}`}
            >
              [ EDITOR ]
            </Link>
            <Link 
              href="/gallery" 
              className={`px-3 py-1.5 rounded transition-colors hover:text-foreground ${location === '/gallery' ? 'bg-secondary text-foreground' : ''}`}
            >
              [ GALLERY ]
            </Link>
            <Link 
              href="/courses" 
              className={`px-3 py-1.5 rounded transition-colors hover:text-foreground ${location === '/courses' || location.startsWith('/courses/') ? 'bg-secondary text-foreground' : ''}`}
            >
              [ COURSES ]
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground font-mono text-xs">
          <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-green-500" /> STATUS: ONLINE</span>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}
