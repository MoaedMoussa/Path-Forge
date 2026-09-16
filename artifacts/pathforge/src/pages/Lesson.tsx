import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaDescription } from '@/hooks/useMetaDescription';
import React, { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, ArrowRight, BookOpen, CircleAlert, Code2, Lightbulb, MessageSquareText, Youtube, Twitter, Linkedin, Share2, Maximize, Minimize, ExternalLink, Link as LinkIcon, PenTool, BrainCircuit } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CourseVisualizer } from '@/components/CourseVisualizer';
import { COURSE_LESSONS, getCourseLesson } from '@/data/courseContent';
import { ChallengeMode } from '@/components/ChallengeMode';
import { LessonCodeEditor } from '@/components/LessonCodeEditor';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ActiveLearning } from '@/components/ActiveLearning';
import { LessonWhiteboard } from '@/components/LessonWhiteboard';
import { LessonNotes } from '@/components/LessonNotes';
import { LessonFeedback } from '@/components/LessonFeedback';
import { motion } from 'framer-motion';
import { useCourseProgress } from '@/hooks/useCourseProgress';
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
  usePageTitle(lesson ? lesson.title : 'Lesson');
  useMetaDescription(lesson ? `Learn about ${lesson.title} in this interactive PathForge Academy module.` : 'Interactive PathForge Lesson');
  const { progress, recordQuiz } = useCourseProgress();
  const [zenMode, setZenMode] = useState(false);

  if (!lesson) return <NotFound />;

  const Icon = lesson.icon;
  const index = COURSE_LESSONS.findIndex(item => item.id === lesson.id);
  const nextLesson = COURSE_LESSONS[(index + 1) % COURSE_LESSONS.length];

  const lessonProgress = progress[lesson.id as keyof typeof progress];
  const quizPassed = lessonProgress?.quizPassed ?? false;
  const alreadyPassed = lessonProgress?.completed ?? false;
  const bestScore = lessonProgress?.bestQuizScore ?? 0;

  const handleQuizComplete = (score: number, total: number) => {
    recordQuiz(lesson.id as any, score, total);
  };

  return (
    <div className={zenMode ? "fixed inset-0 z-50 overflow-y-auto bg-background" : "flex-1 overflow-y-auto bg-background"}>
      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 font-mono">
          {!zenMode ? (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/courses" className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono">ALL COURSE MODULES</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs text-primary font-mono">{lesson.title.toUpperCase()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <div className="text-primary font-bold text-sm tracking-widest flex items-center gap-2">
              <Icon className="w-4 h-4" /> PATHFORGE ZEN
            </div>
          )}
          <div className="flex items-center gap-4">
            {!zenMode && (
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px]">{lesson.category}</Badge>
                <Badge className={`text-[10px] ${accentStyles[lesson.accent]}`}>{lesson.complexity}</Badge>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <Button variant="ghost" size="sm" onClick={() => setZenMode(!zenMode)} className="text-xs">
                {zenMode ? (
                  <><Minimize className="w-4 h-4 mr-2" /> EXIT FOCUS</>
                ) : (
                  <><Maximize className="w-4 h-4 mr-2" /> FOCUS MODE</>
                )}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="lesson" className="w-full">
          <TabsList className="mb-6 border border-border bg-card/40 w-full justify-start p-1 h-auto flex flex-wrap">
            <TabsTrigger value="lesson" className="font-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary border border-transparent">MODULE CONTENT</TabsTrigger>
            <TabsTrigger value="notes" className="font-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary border border-transparent">MY NOTES</TabsTrigger>
            <TabsTrigger value="community" className="font-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary border border-transparent">COMMUNITY</TabsTrigger>
          </TabsList>
          <TabsContent value="lesson" className="space-y-0 mt-0">
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid xl:grid-cols-[0.82fr_1.18fr] gap-6 items-stretch">
          <div className="border border-border bg-card/40 p-6 lg:p-8">
            <div className={`w-12 h-12 border flex items-center justify-center ${accentStyles[lesson.accent]}`}><Icon className="w-6 h-6" /></div>
            <p className="mt-6 text-[10px] font-mono tracking-[0.2em] text-primary">MODULE {String(index + 1).padStart(2, '0')}</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-mono font-bold tracking-tight text-white">{lesson.title}</h1>
            <p className="mt-5 font-mono text-sm leading-7 text-muted-foreground">{lesson.description}</p>
            <div className="mt-7 border-l-2 border-primary pl-4">
              <p className="text-[9px] font-mono tracking-widest text-primary">LEARNING GOAL</p>
              <p className="mt-2 text-sm font-mono text-white leading-6">{lesson.goal}</p>
            </div>
            {!zenMode && (
              <div className="mt-7 flex flex-wrap gap-2">
                {lesson.concepts.map(concept => <Badge key={concept} variant="outline" className="text-[10px] text-muted-foreground">{concept}</Badge>)}
              </div>
            )}
          </div>
          <CourseVisualizer lessonId={lesson.id} />
        </motion.section>

        {!zenMode && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid lg:grid-cols-3 gap-5 mt-7">
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
          </motion.section>
        )}

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-7 border border-border bg-black/40 p-6 lg:p-8">
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
        </motion.section>

        {!zenMode && lesson.resources && lesson.resources.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-7 border border-border bg-black/40 p-6 lg:p-8">
            <div className="flex items-center gap-2 text-primary mb-6">
              <LinkIcon className="w-4 h-4" />
              <h2 className="text-xs font-mono tracking-[0.2em]">EXTERNAL RESOURCES</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {lesson.resources.map((res, i) => (
                <a key={i} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 border border-border bg-card/50 hover:bg-primary/10 hover:border-primary/50 transition-colors rounded text-xs font-mono text-white">
                  {res.title} <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              ))}
            </div>
          </motion.section>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-7">
          <LessonCodeEditor className="min-h-[400px]" />
        </motion.div>

        {!zenMode && lesson.videoId && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-7 border border-border bg-black/40 p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-primary">
                <Youtube className="w-4 h-4" />
                <h2 className="text-xs font-mono tracking-[0.2em]">VIDEO LESSON</h2>
              </div>
              <a 
                href={`https://www.youtube.com/watch?v=${lesson.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-muted-foreground hover:text-white transition-colors"
              >
                OPEN IN YOUTUBE <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative w-full aspect-video border border-border/50 bg-black/80 rounded overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${lesson.videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.section>
        )}

        
        {!zenMode && lesson.matchingExercise && lesson.matchingExercise.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-7 border border-border bg-black/40 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-primary">
                <BrainCircuit className="w-4 h-4" />
                <h2 className="text-xs font-mono tracking-[0.2em]">ACTIVE LEARNING</h2>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Match the concepts</p>
            </div>
            <ActiveLearning exercise={lesson.matchingExercise} />
          </motion.section>
        )}

        {!zenMode && lesson.questions && lesson.questions.length > 0 && (
          <ChallengeMode
            lessonId={lesson.id as any}
            questions={lesson.questions}
            alreadyPassed={quizPassed}
            bestScore={bestScore}
            onComplete={handleQuizComplete}
          />
        )}

        {!zenMode && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-7 border border-border bg-black/40 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-primary">
                <PenTool className="w-4 h-4" />
                <h2 className="text-xs font-mono tracking-[0.2em]">DRAW & SOLVE</h2>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">Test your understanding by sketching the structure.</p>
            </div>
            <LessonWhiteboard lessonId={lesson.id as any} />
          </motion.section>
        )}


        {!zenMode && alreadyPassed && (
          <section className="mt-7 border border-green-500/20 bg-green-500/10 p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <h2 className="text-sm font-mono tracking-widest text-green-300 font-bold flex items-center gap-2">
                <Share2 className="w-4 h-4" /> SHARE YOUR ACHIEVEMENT
              </h2>
              <p className="mt-2 text-xs font-mono text-green-200/70 max-w-xl leading-relaxed">
                You've successfully certified the <strong className="text-green-200">{lesson.title}</strong> module. Show off your progress to the community!
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-green-500/30 text-green-300 hover:bg-green-500/20" onClick={() => {
                const text = encodeURIComponent(`I just completed the "${lesson.title}" module on PathForge Academy! 🚀 #Algorithms #Coding`);
                window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
              }}>
                <Twitter className="w-4 h-4 mr-2" /> X
              </Button>
              <Button variant="outline" className="border-green-500/30 text-green-300 hover:bg-green-500/20" onClick={() => {
                const url = encodeURIComponent(window.location.href);
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
              }}>
                <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
              </Button>
            </div>
          </section>
        )}

          </TabsContent>
          <TabsContent value="notes" className="mt-0 outline-none">
            <LessonNotes lessonId={lesson.id as any} />
          </TabsContent>
          <TabsContent value="community" className="mt-0 outline-none">
            <LessonFeedback lessonId={lesson.id as any} />
          </TabsContent>
        </Tabs>

        {!zenMode && (
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-between">
            <Link href="/courses"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> COURSE OVERVIEW</Button></Link>
            <Link href={`/courses/${nextLesson.id}`}><Button>NEXT: {nextLesson.shortTitle} <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
}