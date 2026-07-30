import { Link } from 'wouter';
import { ArrowRight, BookOpenCheck, ChevronRight, CircleDot, Code2, FlaskConical, PlayCircle } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { COURSE_CATEGORIES, COURSE_CATEGORY_ICONS, COURSE_LESSONS } from '@/data/courseContent';

const accentStyles = {
  cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300 group-hover:border-cyan-400/80',
  violet: 'border-violet-400/30 bg-violet-400/10 text-violet-300 group-hover:border-violet-400/80',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-300 group-hover:border-amber-400/80',
  green: 'border-green-400/30 bg-green-400/10 text-green-300 group-hover:border-green-400/80',
};

export default function Courses() {
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
              Learn the structures that make algorithms work.
            </h1>
            <p className="mt-6 max-w-2xl font-mono text-sm leading-7 text-muted-foreground">
              A hands-on course companion for turning data-structure theory into something you can see, test, and explain in a technical interview.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/courses/arrays"><Button size="lg"><PlayCircle className="w-4 h-4 mr-2" /> START LEARNING</Button></Link>
              <Link href="/"><Button size="lg" variant="outline">OPEN PATHFINDING LAB <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            </div>
          </div>
          <div className="relative mt-10 grid grid-cols-3 max-w-xl border-t border-border/70 pt-5 gap-4 font-mono">
            <Summary value="7" label="Interactive modules" />
            <Summary value="14+" label="Core concepts" />
            <Summary value="1" label="Algorithm playground" />
          </div>
        </section>

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
                    const Icon = lesson.icon;
                    return (
                      <Link key={lesson.id} href={`/courses/${lesson.id}`} className="group">
                        <Card className={`h-full p-5 transition-all duration-200 hover:-translate-y-1 ${accentStyles[lesson.accent]}`}>
                          <div className="flex justify-between items-start gap-4">
                            <div className="w-10 h-10 border border-current/40 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                            <Badge variant="outline" className="text-[9px] border-current/30 text-current">0{index + 1}</Badge>
                          </div>
                          <h4 className="mt-5 text-xl text-white font-mono leading-tight">{lesson.title}</h4>
                          <p className="mt-3 min-h-12 text-xs leading-5 font-mono text-muted-foreground">{lesson.description}</p>
                          <div className="mt-5 pt-4 border-t border-current/20 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-current/90">{lesson.complexity.split(' · ')[0]}</span>
                            <ChevronRight className="w-4 h-4 text-current" />
                          </div>
                        </Card>
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
          <Link href="/"><Button variant="outline">ENTER ALGORITHM LAB <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </section>
      </div>
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