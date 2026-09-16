import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaDescription } from '@/hooks/useMetaDescription';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpenCheck, ChevronRight, CircleDot, Code2, FlaskConical, PlayCircle, CheckCircle2, Flame, BrainCircuit } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { COURSE_CATEGORIES, COURSE_CATEGORY_ICONS, COURSE_LESSONS } from '@/data/courseContent';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ScrollToTop } from '@/components/ScrollToTop';
import { LearningDashboard } from '@/components/LearningDashboard';
import { useCourseProgress } from '@/hooks/useCourseProgress';

const accentStyles = {
  cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300 group-hover:border-cyan-400/80',
  violet: 'border-violet-400/30 bg-violet-400/10 text-violet-300 group-hover:border-violet-400/80',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-300 group-hover:border-amber-400/80',
  green: 'border-green-400/30 bg-green-400/10 text-green-300 group-hover:border-green-400/80',
};

export default function Courses() {
  usePageTitle('Courses');
  useMetaDescription('Browse the PathForge Academy curriculum. Learn Data Structures, Graph Theory, and Pathfinding Algorithms.');

  const { progress, isLoading } = useCourseProgress();
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const dailyChallenge = COURSE_LESSONS[daysSinceEpoch % COURSE_LESSONS.length];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:px-10">
        <section className="relative overflow-hidden border border-border bg-card/40 p-7 md:p-10 mb-8">
          <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(rgba(34,211,238,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.18)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-2 text-primary font-mono text-xs tracking-[0.2em]">
              <FlaskConical className="w-4 h-4" /> PATHFORGE ACADEMY
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-mono font-bold tracking-tight text-white leading-[1.03]">
              Master Data Structures, AI, and System Design.
            </h1>
            <p className="mt-6 max-w-2xl font-mono text-sm leading-7 text-muted-foreground">
              A comprehensive, interactive curriculum for turning abstract computer science theories into concrete skills you can see, test, and explain in technical interviews.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/courses/arrays"><Button size="lg"><PlayCircle className="w-4 h-4 mr-2" /> START LEARNING</Button></Link>
              <Link href="/lab"><Button size="lg" variant="outline">OPEN PATHFINDING LAB <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            </div>
          </div>
          <div className="relative mt-10 grid grid-cols-3 max-w-xl border-t border-border/70 pt-5 gap-4 font-mono">
            <Summary value={COURSE_LESSONS.length.toString()} label="Interactive modules" />
            <Summary value={COURSE_LESSONS.reduce((acc, curr) => acc + curr.concepts.length, 0).toString()} label="Core concepts" />
            <Summary value="1" label="Algorithm playground" />
          </div>
        </section>

        <ProgressTracker />
        <div className="mb-12 mt-8">
          {isLoading ? (
            <div className="border border-border/50 bg-card/20 p-6 md:p-8 flex flex-col gap-6">
              <Skeleton className="h-8 w-48 bg-primary/20" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full bg-primary/10" />)}
              </div>
            </div>
          ) : (
            <LearningDashboard />
          )}
        </div>

        
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <section className="border border-amber-500/30 bg-amber-500/5 p-6 md:p-8 flex flex-col justify-between gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(251,191,36,1)_25%,rgba(251,191,36,1)_50%,transparent_50%,transparent_75%,rgba(251,191,36,1)_75%,rgba(251,191,36,1)_100%)] bg-[length:20px_20px]" />
            <div className="relative flex items-start gap-5">
              <div className="w-12 h-12 shrink-0 border border-amber-500/50 bg-amber-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[10px] tracking-[0.24em] text-amber-400">DAILY CHALLENGE</p>
                  <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-400 rounded-none bg-amber-500/10">TODAY</Badge>
                </div>
                <h2 className="mt-2 font-mono text-xl font-bold text-white tracking-tight">{dailyChallenge.title}</h2>
                <p className="mt-2 max-w-sm text-xs font-mono leading-5 text-amber-100/70">{dailyChallenge.interviewPrompt}</p>
              </div>
            </div>
            <Link href={`/courses/${dailyChallenge.id}`} className="relative self-start">
              <Button className="bg-amber-500 text-black hover:bg-amber-400 font-mono tracking-widest text-[10px] px-6">
                PRACTICE NOW <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </section>

          <section className="border border-violet-500/30 bg-violet-500/5 p-6 md:p-8 flex flex-col justify-between gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,1)_0%,transparent_70%)]" />
            <div className="relative flex items-start gap-5">
              <div className="w-12 h-12 shrink-0 border border-violet-500/50 bg-violet-500/20 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[10px] tracking-[0.24em] text-violet-400">SPACED REPETITION</p>
                </div>
                <h2 className="mt-2 font-mono text-xl font-bold text-white tracking-tight">Study Deck</h2>
                <p className="mt-2 max-w-sm text-xs font-mono leading-5 text-violet-100/70">Master CS concepts using evidence-based flashcards and an intelligent repetition algorithm.</p>
              </div>
            </div>
            <Link href="/flashcards" className="relative self-start">
              <Button className="bg-violet-500 text-white hover:bg-violet-400 font-mono tracking-widest text-[10px] px-6">
                REVIEW CARDS <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </section>
        </div>


        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div>
            <p className="font-mono text-xs text-primary tracking-[0.2em]">CURRICULUM</p>
            <h2 className="mt-2 font-mono text-2xl text-white">Build the mental models first.</h2>
          </div>
          <p className="max-w-lg text-sm font-mono leading-6 text-muted-foreground">
            Each lesson includes a visual experiment, operation costs, concise theory, and an interview-ready question.
          </p>
        </div>

        <div className="space-y-10">
          {COURSE_CATEGORIES.map(category => {
            const Icon = COURSE_CATEGORY_ICONS[category];
            const lessons = COURSE_LESSONS.filter(lesson => lesson.category === category);
            return (
              <section key={category}>
                <div className="flex items-center gap-3 mb-4 font-mono">
                  <div className="w-8 h-8 border border-primary/30 bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
                  <h3 className="text-sm text-white tracking-widest uppercase">{category}</h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] text-muted-foreground">{lessons.length.toString().padStart(2, '0')} MODULES</span>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {lessons.map((lesson, index) => {
                    if (isLoading) {
                      return (
                        <div key={lesson.id} className="border border-border/50 bg-card/20 rounded-lg p-5 flex flex-col h-[220px]">
                          <div className="flex justify-between items-start mb-5">
                            <Skeleton className="w-10 h-10 bg-primary/20" />
                            <Skeleton className="w-8 h-4 bg-primary/10" />
                          </div>
                          <Skeleton className="h-6 w-3/4 bg-primary/20 mb-3" />
                          <Skeleton className="h-4 w-full bg-primary/10 mb-2" />
                          <Skeleton className="h-4 w-2/3 bg-primary/10" />
                          <div className="mt-auto pt-4 border-t border-border/20 flex justify-between">
                            <Skeleton className="h-3 w-16 bg-muted/20" />
                            <Skeleton className="h-4 w-4 bg-muted/20" />
                          </div>
                        </div>
                      );
                    }
                    const Icon = lesson.icon;
                    const lessonId = lesson.id as keyof typeof progress;
                    const isCompleted = progress[lessonId]?.completed;
                    return (
                      <Link key={lesson.id} href={`/courses/${lesson.id}`} className="group block h-full">
                        <motion.div whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="h-full">
                          <Card className={`h-full p-5 transition-colors duration-200 ${accentStyles[lesson.accent]} relative`}>
                          {isCompleted && (
                            <div className="absolute top-0 right-0 m-4 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="flex justify-between items-start gap-4">
                            <div className="w-10 h-10 border border-current/40 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                            {!isCompleted && <Badge variant="outline" className="text-[9px] border-current/30 text-current">0{index + 1}</Badge>}
                          </div>
                          <h4 className="mt-5 text-xl text-white font-mono leading-tight">{lesson.title}</h4>
                          <p className="mt-3 min-h-12 text-xs leading-5 font-mono text-muted-foreground">{lesson.description}</p>
                          <div className="mt-5 pt-4 border-t border-current/20 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-current/90">{lesson.complexity.split(' · ')[0]}</span>
                            <ChevronRight className="w-4 h-4 text-current" />
                          </div>
                          </Card>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-12 border border-border bg-black/40 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-primary/40 bg-primary/10 flex items-center justify-center"><Code2 className="w-5 h-5 text-primary" /></div>
            <div>
              <h2 className="font-mono text-lg text-white">From course theory to real search behavior.</h2>
              <p className="mt-2 max-w-2xl text-xs font-mono leading-5 text-muted-foreground">Apply graph traversal, queues, priority heuristics, and complexity trade-offs in the original procedural dungeon lab.</p>
            </div>
          </div>
          <Link href="/lab"><Button variant="outline">ENTER ALGORITHM LAB <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </section>
      </div>
      <ScrollToTop />
    </div>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl text-white font-bold">{value}</p>
      <p className="mt-1 text-[9px] text-muted-foreground tracking-widest uppercase">{label}</p>
    </div>
  );
}