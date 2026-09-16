import { Trophy, CheckCircle2, Flame, Award } from 'lucide-react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { COURSE_LESSONS } from '@/data/courseContent';

export function ProgressTracker() {
  const { summary, progress } = useCourseProgress();
  const totalLessons = COURSE_LESSONS.length;
  const progressPercentage = Math.round((summary.completed / totalLessons) * 100) || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono mb-8">
      <div className="border border-border bg-card/40 p-5 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center mb-3">
          <Award className="w-5 h-5 text-primary" />
        </div>
        <p className="text-2xl text-white font-bold">{progressPercentage}%</p>
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Completion</p>
      </div>

      <div className="border border-border bg-card/40 p-5 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-2xl text-white font-bold">{summary.completed} / {totalLessons}</p>
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Modules Passed</p>
      </div>

      <div className="border border-border bg-card/40 p-5 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center mb-3">
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
        <p className="text-2xl text-white font-bold">{summary.quizPassed}</p>
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Quizzes Aced</p>
      </div>

      <div className="border border-border bg-card/40 p-5 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full border border-orange-500/30 bg-orange-500/10 flex items-center justify-center mb-3">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <p className="text-2xl text-white font-bold">{summary.streak}</p>
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Day Streak</p>
      </div>
    </div>
  );
}
