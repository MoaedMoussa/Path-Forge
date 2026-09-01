import React from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, Cpu } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="h-14 border-b border-border flex items-center px-4 justify-between shrink-0 bg-card/50 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Cpu className="w-5 h-5" />
            <span className="hidden font-mono font-bold tracking-tight sm:inline">PATHFORGE</span>
          </Link>
          <nav className="ml-2 flex min-w-0 items-center gap-0.5 overflow-x-auto text-[9px] font-mono text-muted-foreground sm:ml-6 sm:gap-1 sm:text-sm">
            <Link 
              href="/" 
              className={`whitespace-nowrap rounded px-1.5 py-1.5 transition-colors hover:text-foreground sm:px-3 ${location === '/' ? 'bg-secondary text-foreground' : ''}`}
            >
              [ HOME ]
            </Link>
            <Link 
              href="/lab" 
              className={`whitespace-nowrap rounded px-1.5 py-1.5 transition-colors hover:text-foreground sm:px-3 ${location === '/lab' ? 'bg-secondary text-foreground' : ''}`}
            >
              [ LAB ]
            </Link>
            <Link 
              href="/gallery" 
              className={`whitespace-nowrap rounded px-1.5 py-1.5 transition-colors hover:text-foreground sm:px-3 ${location === '/gallery' ? 'bg-secondary text-foreground' : ''}`}
            >
              [ GALLERY ]
            </Link>
            <Link 
              href="/courses" 
              className={`whitespace-nowrap rounded px-1.5 py-1.5 transition-colors hover:text-foreground sm:px-3 ${location === '/courses' || location.startsWith('/courses/') ? 'bg-secondary text-foreground' : ''}`}
            >
              [ COURSES ]
            </Link>
          </nav>
        </div>
        <div className="hidden items-center gap-4 text-muted-foreground font-mono text-xs sm:flex">
          <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-green-500" /> STATUS: ONLINE</span>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}
