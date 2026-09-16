import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaDescription } from '@/hooks/useMetaDescription';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoute, Link } from 'wouter';
import { BrainCircuit, Check, X, RotateCcw, ArrowLeft, Lightbulb, Trophy } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { FLASHCARDS } from '@/data/flashcards';

export default function StudyDeck() {
  usePageTitle('Flashcards');
  useMetaDescription('Test your computer science knowledge with interactive Flashcards covering graphs, big O notation, and AI.');

  const { getDueCards, getStats, reviewCard, resetProgress } = useSpacedRepetition();
  
  // Get initial due cards and randomize them slightly for study
  const dueCards = useMemo(() => {
    const cards = getDueCards();
    return cards.sort(() => Math.random() - 0.5);
  }, []); // Only compute once on mount so the list doesn't shift unexpectedly

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const stats = getStats();
  const currentCard = dueCards[currentIndex];

  const handleRate = (quality: number) => {
    if (!currentCard) return;
    
    // Save review
    reviewCard(currentCard.id, quality);
    
    // Move to next card
    setIsFlipped(false);
    
    // Small timeout to allow flip animation to reset before changing content
    setTimeout(() => {
      if (currentIndex < dueCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCompleted(true);
      }
    }, 150);
  };

  const handleReset = () => {
    resetProgress();
    window.location.reload();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-6 py-10 lg:px-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/courses">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-widest">
                <BrainCircuit className="w-3 h-3" />
                SPACED REPETITION
              </div>
              <h1 className="text-2xl font-mono font-bold text-white mt-1">Study Deck</h1>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
            <div className="text-center px-3 py-1 bg-card border border-border rounded">
              <div className="text-muted-foreground text-[9px] uppercase">Cards Due</div>
              <div className="text-primary font-bold">{stats.due}</div>
            </div>
            <div className="text-center px-3 py-1 bg-card border border-border rounded">
              <div className="text-muted-foreground text-[9px] uppercase">Mastered</div>
              <div className="text-green-400 font-bold">{stats.mastered}</div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          
          <AnimatePresence mode="wait">
            {!completed && currentCard ? (
              <motion.div
                key="card-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl"
              >
                {/* Progress indicator */}
                <div className="mb-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>Card {currentIndex + 1} of {dueCards.length}</span>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/10">
                    {currentCard.category}
                  </Badge>
                </div>

                {/* Flip Container */}
                <div 
                  className="relative w-full h-[400px] cursor-pointer"
                  style={{ perspective: '1000px' }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                  >
                    {/* Front of Card */}
                    <Card 
                      className="absolute w-full h-full p-8 md:p-12 flex flex-col justify-center items-center text-center border-border/60 bg-card/40 hover:border-primary/50 transition-colors shadow-2xl"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="absolute top-6 left-6 text-primary/50">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-mono text-white leading-relaxed">
                        {currentCard.front}
                      </h2>
                      <p className="absolute bottom-6 text-[10px] font-mono tracking-widest text-muted-foreground uppercase animate-pulse">
                        Click to flip
                      </p>
                    </Card>

                    {/* Back of Card */}
                    <Card 
                      className="absolute w-full h-full p-8 md:p-12 flex flex-col justify-center items-center text-center border-primary/40 bg-primary/5 shadow-2xl"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div className="absolute top-6 left-6 text-primary/80">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="text-xl md:text-2xl font-mono text-primary/90 leading-relaxed">
                        {currentCard.back}
                      </p>
                    </Card>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex items-center justify-center gap-3">
                  <AnimatePresence>
                    {isFlipped ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center justify-center gap-3 w-full"
                      >
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="flex-1 md:flex-none border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          onClick={(e) => { e.stopPropagation(); handleRate(0); }}
                        >
                          AGAIN
                        </Button>
                        <Button 
                          variant="outline"
                          size="lg"
                          className="flex-1 md:flex-none border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                          onClick={(e) => { e.stopPropagation(); handleRate(1); }}
                        >
                          HARD
                        </Button>
                        <Button 
                          variant="outline"
                          size="lg"
                          className="flex-1 md:flex-none border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                          onClick={(e) => { e.stopPropagation(); handleRate(2); }}
                        >
                          GOOD
                        </Button>
                        <Button 
                          variant="default"
                          size="lg"
                          className="flex-1 md:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={(e) => { e.stopPropagation(); handleRate(3); }}
                        >
                          EASY
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-mono text-muted-foreground"
                      >
                        Think of the answer before flipping.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="completion-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6">
                  <Trophy className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-3xl font-mono font-bold text-white mb-4">Deck Complete</h2>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed mb-8">
                  Great job! You've reviewed all due cards for today. 
                  Spaced repetition works best when you practice daily.
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/courses">
                    <Button className="w-full">RETURN TO ACADEMY</Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" /> RESET PROGRESS
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
