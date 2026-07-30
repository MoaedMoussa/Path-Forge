import { Link, useRoute } from 'wouter';
import { ArrowLeft, ArrowRight, BookOpen, CircleAlert, Code2, Lightbulb, MessageSquareText } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { CourseVisualizer } from '@/components/CourseVisualizer';
import { COURSE_LESSONS, getCourseLesson } from '@/data/courseContent';
import NotFound from './not-found';

const accentStyles = {
  cyan: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
  violet: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
  amber: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  green: 'border-green-400/40 bg-green-400/10 text-green-300',
};

export default function Lesson() {
  const [, params] = useRoute('/courses/:id');
  const lesson = getCourseLesson(params?.id);
  if (!lesson) return <NotFound />;

  const Icon = lesson.icon;
  const index = COURSE_LESSONS.findIndex(item => item.id === lesson.id);
  const nextLesson = COURSE_LESSONS[(index + 1) % COURSE_LESSONS.length];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 font-mono">
          <Link href="/courses" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> ALL COURSE MODULES
          </Link>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-[10px]">{lesson.category}</Badge>
            <Badge className={`text-[10px] ${accentStyles[lesson.accent]}`}>{lesson.complexity}</Badge>
          </div>
        </div>

        <section className="grid xl:grid-cols-[0.82fr_1.18fr] gap-6 items-stretch">
          <div className="border border-border bg-card/40 p-6 lg:p-8">
            <div className={`w-12 h-12 border flex items-center justify-center ${accentStyles[lesson.accent]}`}><Icon className="w-6 h-6" /></div>
            <p className="mt-6 text-[10px] font-mono tracking-[0.2em] text-primary">MODULE {String(index + 1).padStart(2, '0')}</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-mono font-bold tracking-tight text-white">{lesson.title}</h1>
            <p className="mt-5 font-mono text-sm leading-7 text-muted-foreground">{lesson.description}</p>
            <div className="mt-7 border-l-2 border-primary pl-4">
              <p className="text-[9px] font-mono tracking-widest text-primary">LEARNING GOAL</p>
              <p className="mt-2 text-sm font-mono text-white leading-6">{lesson.goal}</p>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {lesson.concepts.map(concept => <Badge key={concept} variant="outline" className="text-[10px] text-muted-foreground">{concept}</Badge>)}
            </div>
          </div>
          <CourseVisualizer lessonId={lesson.id} />
        </section>

        <section className="grid lg:grid-cols-3 gap-5 mt-7">
          <Card className="p-5 bg-card/50">
            <div className="flex items-center gap-2 text-primary"><BookOpen className="w-4 h-4" /><h2 className="text-xs font-mono tracking-widest">WHY IT MATTERS</h2></div>
            <p className="mt-4 text-sm leading-6 font-mono text-muted-foreground">{lesson.whyItMatters}</p>
          </Card>
          <Card className="p-5 bg-card/50">
            <div className="flex items-center gap-2 text-amber-300"><MessageSquareText className="w-4 h-4" /><h2 className="text-xs font-mono tracking-widest">INTERVIEW PROMPT</h2></div>
            <p className="mt-4 text-sm leading-6 font-mono text-white">{lesson.interviewPrompt}</p>
          </Card>
          <Card className="p-5 bg-card/50">
            <div className="flex items-center gap-2 text-violet-300"><CircleAlert className="w-4 h-4" /><h2 className="text-xs font-mono tracking-widest">COMPLEXITY</h2></div>
            <p className="mt-4 text-lg font-mono text-white">{lesson.complexity}</p>
            <p className="mt-3 text-xs leading-5 font-mono text-muted-foreground">Always state the operation and the assumptions behind the Big-O claim.</p>
          </Card>
        </section>

        <section className="mt-7 border border-border bg-black/40 p-6 lg:p-8">
          <div className="flex items-center gap-2 text-primary mb-6"><Lightbulb className="w-4 h-4" /><h2 className="text-xs font-mono tracking-[0.2em]">THE MENTAL MODEL</h2></div>
          <div className="grid md:grid-cols-3 gap-5">
            {lesson.steps.map((step, stepIndex) => (
              <div key={step.title} className="relative border border-border bg-card/50 p-5">
                <span className="absolute -top-3 left-4 bg-black px-2 text-[10px] font-mono text-primary">0{stepIndex + 1}</span>
                <h3 className="font-mono text-white">{step.title}</h3>
                <p className="mt-3 text-xs leading-6 font-mono text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-between">
          <Link href="/courses"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> COURSE OVERVIEW</Button></Link>
          <Link href={`/courses/${nextLesson.id}`}><Button>NEXT: {nextLesson.shortTitle} <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>
      </div>
    </div>
  );
}