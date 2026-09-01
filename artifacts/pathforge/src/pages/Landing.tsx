import { Link } from 'wouter';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Database,
  FlaskConical,
  GitBranch,
  Layers3,
  Network,
  Terminal,
} from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';

const destinations = [
  {
    eyebrow: '01 / EXPERIMENT',
    title: 'Algorithm Lab',
    description: 'Generate a world, choose a strategy, and watch six pathfinding algorithms compete for the route.',
    detail: 'PROCEDURAL WORLDS · LIVE SEARCH',
    href: '/lab',
    icon: FlaskConical,
    accent: 'cyan',
    action: 'ENTER THE LAB',
    featured: true,
  },
  {
    eyebrow: '02 / BUILD CONTEXT',
    title: 'PathForge Academy',
    description: 'Make data structures click through visual lessons, interactive labs, quizzes, and practice puzzles.',
    detail: '7 MODULES · VISUAL LEARNING',
    href: '/courses',
    icon: BookOpenCheck,
    accent: 'violet',
    action: 'VIEW COURSES',
    featured: false,
  },
  {
    eyebrow: '03 / DISCOVER',
    title: 'Level Gallery',
    description: 'Browse generated worlds from the archive, then run a pathfinder against someone else’s design.',
    detail: 'PUBLIC ARCHIVE · SHARED WORLDS',
    href: '/gallery',
    icon: Database,
    accent: 'amber',
    action: 'BROWSE LEVELS',
    featured: false,
  },
] as const;

const accentClasses = {
  cyan: {
    icon: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
    hover: 'group-hover:border-cyan-400/70',
    line: 'bg-cyan-400',
    text: 'text-cyan-300',
  },
  violet: {
    icon: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
    hover: 'group-hover:border-violet-400/70',
    line: 'bg-violet-400',
    text: 'text-violet-300',
  },
  amber: {
    icon: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    hover: 'group-hover:border-amber-400/70',
    line: 'bg-amber-400',
    text: 'text-amber-300',
  },
};

export default function Landing() {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_0%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_10%_30%,rgba(139,92,246,0.08),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
          <section className="grid items-end gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] text-primary">
                <span className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-2.5 py-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  SYSTEM ONLINE
                </span>
                <span className="text-muted-foreground">LEARNING OS / 01</span>
              </div>
              <h1 className="mt-7 max-w-4xl font-mono text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                Find your way through
                <span className="block text-primary">computer science.</span>
              </h1>
              <p className="mt-6 max-w-xl font-mono text-sm leading-7 text-muted-foreground sm:text-base">
                PathForge is a hands-on space for turning algorithms into something you can see, run, and explain.
                Start with a route, a lesson, or a world built by the community.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/lab">
                  <Button size="lg">
                    START EXPLORING <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  NO ACCOUNT REQUIRED
                </span>
              </div>
            </div>

            <div className="relative border border-border bg-black/40 p-5 font-mono shadow-2xl shadow-cyan-950/10 sm:p-6">
              <div className="absolute -left-px top-7 h-14 w-px bg-primary" />
              <div className="flex items-center justify-between border-b border-border pb-4 text-[10px] tracking-[0.18em]">
                <span className="text-primary">PATHFORGE // CORE</span>
                <span className="text-muted-foreground">BUILD 2026.09</span>
              </div>
              <div className="py-6">
                <div className="flex items-center gap-3 text-white">
                  <Terminal className="h-5 w-5 text-primary" />
                  <span className="text-sm">Choose a direction</span>
                </div>
                <p className="mt-3 max-w-sm text-xs leading-6 text-muted-foreground">
                  Every section shares the same goal: make the invisible mechanics of software visible.
                </p>
              </div>
              <div className="grid gap-3 border-t border-border pt-4 text-[10px]">
                <StatusRow icon={GitBranch} label="ALGORITHMS" value="TRACEABLE" />
                <StatusRow icon={Layers3} label="DATA STRUCTURES" value="INTERACTIVE" />
                <StatusRow icon={Network} label="COMMUNITY LEVELS" value="SHAREABLE" />
              </div>
            </div>
          </section>

          <section className="mt-16">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.24em] text-primary">SELECT A MODULE</p>
                <h2 className="mt-2 font-mono text-xl text-white sm:text-2xl">Where do you want to start?</h2>
              </div>
              <Badge variant="outline" className="hidden font-mono text-[9px] text-muted-foreground sm:inline-flex">
                03 PATHS AVAILABLE
              </Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {destinations.map(destination => {
                const Icon = destination.icon;
                const accent = accentClasses[destination.accent];
                return (
                  <Link key={destination.href} href={destination.href} className="group">
                    <Card
                      className={`relative h-full overflow-hidden bg-card/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-card ${accent.hover} ${
                        destination.featured ? 'border-primary/50 shadow-lg shadow-cyan-950/10' : ''
                      }`}
                    >
                      {destination.featured && (
                        <span className="absolute right-5 top-5 font-mono text-[9px] tracking-widest text-primary">
                          RECOMMENDED
                        </span>
                      )}
                      <div className={`flex h-11 w-11 items-center justify-center border ${accent.icon}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className={`mt-7 font-mono text-[10px] tracking-[0.18em] ${accent.text}`}>{destination.eyebrow}</p>
                      <h3 className="mt-2 font-mono text-2xl font-bold tracking-tight text-white">{destination.title}</h3>
                      <p className="mt-4 min-h-[72px] font-mono text-xs leading-6 text-muted-foreground">
                        {destination.description}
                      </p>
                      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                        <span className="font-mono text-[9px] tracking-widest text-muted-foreground">{destination.detail}</span>
                        <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${accent.text}`} />
                      </div>
                      <div className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-200 group-hover:w-full ${accent.line}`} />
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-3">
            <Principle icon={CheckCircle2} number="01" title="Generate" detail="Create a deterministic world from a seed." />
            <Principle icon={GitBranch} number="02" title="Observe" detail="See the frontier expand one decision at a time." />
            <Principle icon={BookOpenCheck} number="03" title="Understand" detail="Connect the behavior back to the underlying idea." />
          </section>

          <footer className="flex flex-col gap-2 py-8 font-mono text-[10px] tracking-widest text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>PATHFORGE / COMPUTATIONAL EXPLORATION</span>
            <span>BUILT TO MAKE COMPLEXITY VISIBLE</span>
          </footer>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ icon: Icon, label, value }: { icon: typeof GitBranch; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-3 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary/80" />
        {label}
      </span>
      <span className="flex items-center gap-2 text-green-400">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        {value}
      </span>
    </div>
  );
}

function Principle({ icon: Icon, number, title, detail }: { icon: typeof CheckCircle2; number: string; title: string; detail: string }) {
  return (
    <div className="bg-card/60 p-5">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="font-mono text-[10px] tracking-widest text-primary">{number}</span>
        <span className="font-mono text-sm text-white">{title}</span>
      </div>
      <p className="mt-3 pl-7 font-mono text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}