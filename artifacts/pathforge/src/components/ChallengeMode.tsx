import { useMemo, useState } from 'react';
import { Check, ShieldCheck, X, Zap } from 'lucide-react';
import type { CourseId, QuizQuestion } from '@/data/courseContent';
import { Button, Card } from './ui';
import { motion, AnimatePresence } from 'framer-motion';

interface ChallengeModeProps {
  lessonId: CourseId;
  questions: QuizQuestion[];
  alreadyPassed: boolean;
  bestScore: number;
  onComplete: (score: number, total: number) => void;
}

export function ChallengeMode({ lessonId, questions, alreadyPassed, bestScore, onComplete }: ChallengeModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isRevealed, setIsRevealed] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);

  const score = useMemo(
    () => questions.reduce((total, question, index) => total + (answers[index] === question.answerIndex ? 1 : 0), 0),
    [answers, questions]
  );

  const handleSelectOption = (optionIndex: number) => {
    if (isRevealed || challengeComplete) return;
    
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      setChallengeComplete(true);
      onComplete(score, questions.length);
    }
  };

  const reset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsRevealed(false);
    setChallengeComplete(false);
  };

  const scoreIsPerfect = score === questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion?.answerIndex;

  return (
    <section className="mt-7 border border-border bg-card/40 p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Zap className="w-32 h-32 text-primary" />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4" />
            <h2 className="text-xs font-mono tracking-[0.2em] font-bold">CHALLENGE MODE</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 font-mono text-muted-foreground">
            Fast-paced knowledge retrieval. Answer correctly to boost your score and unlock exclusive gallery content.
          </p>
        </div>
        
        {alreadyPassed ? (
          <div className="inline-flex items-center gap-2 border border-green-400/40 bg-green-400/10 px-3 py-2 font-mono text-xs text-green-300">
            <Check className="w-4 h-4" /> CHALLENGE MASTERED
          </div>
        ) : bestScore > 0 ? (
          <div className="border border-amber-400/30 bg-amber-400/10 px-3 py-2 font-mono text-xs text-amber-300">
            BEST: {bestScore}/{questions.length}
          </div>
        ) : null}
      </div>

      {!challengeComplete ? (
        <div className="mt-8 relative z-10">
          <div className="flex justify-between items-center mb-4 font-mono text-xs text-muted-foreground">
            <span>QUESTION {currentQuestionIndex + 1} OF {questions.length}</span>
            <span>CURRENT SCORE: {score}</span>
          </div>
          
          <div className="w-full bg-black/50 h-1.5 mb-6 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestionIndex}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 bg-black/60 border-border">
                <p className="font-mono text-base md:text-lg leading-7 text-white mb-6">
                  {currentQuestion.prompt}
                </p>
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const chosen = selectedAnswer === optionIndex;
                    const correctOption = isRevealed && optionIndex === currentQuestion.answerIndex;
                    const wrongOption = isRevealed && chosen && !isCorrect;

                    let btnClass = "border-border bg-card hover:border-primary/60 text-muted-foreground hover:text-white";
                    if (correctOption) {
                      btnClass = "border-green-400/70 bg-green-400/10 text-green-200 shadow-[0_0_15px_rgba(74,222,128,0.2)]";
                    } else if (wrongOption) {
                      btnClass = "border-red-400/70 bg-red-400/10 text-red-200";
                    } else if (isRevealed && !chosen && !correctOption) {
                      btnClass = "border-border/30 bg-black/20 text-muted-foreground/50 opacity-50";
                    }

                    return (
                      <motion.button
                        key={optionIndex}
                        whileHover={!isRevealed ? { scale: 1.01 } : {}}
                        whileTap={!isRevealed ? { scale: 0.99 } : {}}
                        disabled={isRevealed}
                        onClick={() => handleSelectOption(optionIndex)}
                        className={`flex items-center gap-4 border px-4 py-4 text-left font-mono text-sm transition-all duration-300 rounded ${btnClass}`}
                      >
                        <span className={`w-6 h-6 shrink-0 border rounded-sm flex items-center justify-center text-[10px] ${correctOption ? 'border-green-400/50' : wrongOption ? 'border-red-400/50' : 'border-current/50'}`}>
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {correctOption && <Check className="w-5 h-5 text-green-400 shrink-0" />}
                        {wrongOption && <X className="w-5 h-5 text-red-400 shrink-0" />}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {isRevealed && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div className={`mt-6 p-4 rounded border-l-4 text-sm leading-6 font-mono ${isCorrect ? 'border-green-400 bg-green-400/10 text-green-100' : 'border-amber-400 bg-amber-400/10 text-amber-100'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {isCorrect ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-amber-400" />}
                          <span className="font-bold">{isCorrect ? 'CORRECT' : 'INCORRECT'}</span>
                        </div>
                        {currentQuestion.explanation}
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button onClick={handleNext} className="bg-primary text-primary-foreground font-bold tracking-widest text-xs">
                          {currentQuestionIndex < questions.length - 1 ? 'NEXT QUESTION' : 'VIEW RESULTS'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 text-center bg-black/60 border border-border p-8 rounded relative z-10"
        >
          <Zap className={`w-16 h-16 mx-auto mb-4 ${scoreIsPerfect ? 'text-green-400' : 'text-amber-400'}`} />
          <h3 className="text-xl font-mono text-white mb-2">CHALLENGE COMPLETE</h3>
          <p className="font-mono text-muted-foreground mb-6">
            You scored <strong className="text-white text-lg">{score}</strong> out of <strong className="text-white text-lg">{questions.length}</strong>
          </p>
          
          {scoreIsPerfect ? (
            <div className="bg-green-400/10 border border-green-400/30 text-green-300 p-4 mb-6 text-sm font-mono inline-block">
              FLAWLESS VICTORY. MODULE CERTIFIED.
            </div>
          ) : (
            <div className="bg-amber-400/10 border border-amber-400/30 text-amber-300 p-4 mb-6 text-sm font-mono inline-block">
              NOT QUITE THERE. TRY AGAIN FOR A PERFECT SCORE TO UNLOCK EXCLUSIVE CONTENT.
            </div>
          )}
          
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" onClick={reset}>
              RESTART CHALLENGE
            </Button>
          </div>
        </motion.div>
      )}
    </section>
  );
}
