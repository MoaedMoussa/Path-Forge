import React from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, Cpu, ChevronRight } from 'lucide-react';
import { getCourseLesson } from '@/data/courseContent';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const pathParts = location.split('/').filter(Boolean);

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
              className={`whitespace-nowrap rounded px-1.5 py-1.5 transition-colors hover:text-foreground sm:px-3 ${location === '/courses' || (location.startsWith('/courses/') && !location.startsWith('/courses/study-groups')) ? 'bg-secondary text-foreground' : ''}`}
            >
              [ COURSES ]
            </Link>
            <Link 
              href="/study-groups" 
              className={`whitespace-nowrap rounded px-1.5 py-1.5 transition-colors hover:text-foreground sm:px-3 ${location.startsWith('/study-groups') ? 'bg-secondary text-foreground' : ''}`}
            >
              [ STUDY GROUPS ]
            </Link>
          </nav>
        </div>
        <div className="hidden items-center gap-4 text-muted-foreground font-mono text-xs sm:flex">
          <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-green-500" /> STATUS: ONLINE</span>
        </div>
      </header>
      
      {location !== '/' && (
        <div className="border-b border-border/50 bg-black/10 px-4 py-2 flex items-center gap-2 text-[10px] font-mono text-muted-foreground shrink-0 overflow-x-auto">
          <Link href="/" className="hover:text-foreground transition-colors whitespace-nowrap shrink-0">HOME</Link>
          {pathParts.map((part, i) => {
            const isLast = i === pathParts.length - 1;
            let label = part.toUpperCase();
            let href = '/' + pathParts.slice(0, i + 1).join('/');

            if (part === 'courses' && i === 0) {
              label = 'ACADEMY';
            } else if (pathParts[0] === 'courses' && i === 1) {
              const lesson = getCourseLesson(part);
              label = lesson ? lesson.title.toUpperCase() : part.toUpperCase();
            } else if (pathParts[0] === 'level' && i === 1) {
              label = part.toUpperCase();
            } else if (part === 'study-groups' && i === 0) {
              label = 'STUDY GROUPS';
            } else if (pathParts[0] === 'study-groups' && i === 1) {
              label = 'ACTIVE SESSION';
            }

            return (
              <React.Fragment key={part}>
                <ChevronRight className="w-3 h-3 opacity-30 shrink-0" />
                {isLast ? (
                  <span className="text-primary/90 font-bold whitespace-nowrap shrink-0">{label}</span>
                ) : (
                  <Link href={href} className="hover:text-foreground transition-colors whitespace-nowrap shrink-0">{label}</Link>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
      
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>

      <footer className="border-t border-border bg-card/30 shrink-0 py-8 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-4">
              <Cpu className="w-4 h-4" />
              <span className="font-bold tracking-tight">PATHFORGE</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Master Data Structures, AI, and System Design with interactive visualization algorithms.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">LEARN</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/courses" className="hover:text-primary transition-colors">Curriculum</Link></li>
              <li><Link href="/courses/1-graphs" className="hover:text-primary transition-colors">Graph Theory</Link></li>
              <li><Link href="/courses/3-astar" className="hover:text-primary transition-colors">A* Pathfinding</Link></li>
              <li><Link href="/flashcards" className="hover:text-primary transition-colors">Flashcards</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">PRACTICE</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/lab" className="hover:text-primary transition-colors">Interactive Lab</Link></li>
              <li><Link href="/gallery" className="hover:text-primary transition-colors">Level Gallery</Link></li>
              <li><Link href="/study-groups" className="hover:text-primary transition-colors">Study Groups</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">LEGAL</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-border/50 text-muted-foreground/50 text-[10px] text-center">
          &copy; {new Date().getFullYear()} PathForge Academy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
