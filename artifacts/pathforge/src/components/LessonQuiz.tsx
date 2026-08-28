import { useMemo, useState } from 'react';
import { Check, CircleCheckBig, RotateCcw, ShieldCheck, X } from 'lucide-react';
import type { CourseId, QuizQuestion } from '@/data/courseContent';
import { Button, Card } from './ui';

interface LessonQuizProps {
  lessonId: CourseId;
  questions: QuizQuestion[];
  alreadyPassed: boolean;
  bestScore: number;
  onComplete: (score: number, total: number) => void;
}

export function LessonQuiz({ lessonId, questions, alreadyPassed, bestScore, onComplete }: LessonQuizProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () => questions.reduce((total, question, index) => total + (answers[index] === question.answerIndex ? 1 : 0), 0),
    [answers, questions],
  );

  const submit = () => {
    if (Object.keys(answers).length !== questions.length) return;
    setSubmitted(true);
    onComplete(score, questions.length);
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const scoreIsPerfect = score === questions.length;

  return (
    <section className="mt-7 border border-border bg-card/40 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-4 h-4" />
            <h2 className="text-xs font-mono tracking-[0.2em]">KNOWLEDGE CHECK</h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 font-mono text-muted-foreground">
            Answer all {questions.length} questions correctly to certify the module. Your best result stays saved on this device.
          </p>
        </div>
        {alreadyPassed ? (
          <div className="inline-flex items-center gap-2 border border-green-400/40 bg-green-400/10 px-3 py-2 font-mono text-xs text-green-300">
            <CircleCheckBig className="w-4 h-4" /> QUIZ CERTIFIED
          </div>
        ) : bestScore > 0 ? (
          <div className="border border-amber-400/30 bg-amber-400/10 px-3 py-2 font-mono text-xs text-amber-300">
            BEST: {bestScore}/{questions.length}
          </div>
        ) : null}
      </div>

      <div className="mt-7 grid gap-4">
        {questions.map((question, index) => {
          const selected = answers[index];
          const isCorrect = selected === question.answerIndex;
          return (
            <Card key={question.prompt} className="p-5 bg-black/40">
              <div className="flex items-start gap-3">
                <span className="flex w-6 h-6 shrink-0 items-center justify-center border border-primary/40 text-[10px] font-mono text-primary">{String(index + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm leading-6 text-white">{question.prompt}</p>
                  <div className="mt-4 grid gap-2">
                    {question.options.map((option, optionIndex) => {
                      const chosen = selected === optionIndex;
                      const correctOption = submitted && optionIndex === question.answerIndex;
                      const wrongOption = submitted && chosen && !isCorrect;
                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={submitted}
                          onClick={() => setAnswers(current => ({ ...current, [index]: optionIndex }))}
                          className={`flex items-center gap-3 border px-3 py-3 text-left font-mono text-xs transition-colors ${
                            correctOption
                              ? 'border-green-400/70 bg-green-400/10 text-green-200'
                              : wrongOption
                                ? 'border-red-400/70 bg-red-400/10 text-red-200'
                                : chosen
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-card hover:border-primary/60 text-muted-foreground'
                          }`}
                        >
                          <span className="w-5 h-5 shrink-0 border border-current/50 flex items-center justify-center text-[9px]">{String.fromCharCode(65 + optionIndex)}</span>
                          <span>{option}</span>
                          {correctOption && <Check className="ml-auto w-4 h-4" />}
                          {wrongOption && <X className="ml-auto w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className={`mt-4 border-l-2 pl-3 text-xs leading-5 font-mono ${isCorrect ? 'border-green-400 text-green-200' : 'border-amber-400 text-amber-200'}`}>
                      <span className="font-bold">{isCorrect ? 'Correct. ' : 'Review: '}</span>
                      {question.explanation}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <Button onClick={submit} disabled={Object.keys(answers).length !== questions.length}>
            SUBMIT {Object.keys(answers).length}/{questions.length} ANSWERS
          </Button>
        ) : (
          <>
            <div className={`font-mono text-sm ${scoreIsPerfect ? 'text-green-300' : 'text-amber-300'}`}>
              {scoreIsPerfect ? 'MODULE KNOWLEDGE CERTIFIED' : `SCORE: ${score}/${questions.length} — TRY AGAIN FOR CERTIFICATION`}
            </div>
            <Button variant="outline" onClick={reset}><RotateCcw className="mr-2 w-3.5 h-3.5" /> RETAKE QUIZ</Button>
          </>
        )}
      </div>
    </section>
  );
}