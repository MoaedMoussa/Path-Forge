import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the closest scrollable ancestor
    const scrollContainer = containerRef.current?.closest('.overflow-y-auto') || window;
    
    const handleScroll = () => {
      let scrollTop = 0;
      if (scrollContainer === window) {
        scrollTop = window.scrollY;
      } else {
        scrollTop = (scrollContainer as HTMLElement).scrollTop;
      }
      
      // Show button when page is scrolled down past 400px (typically past hero)
      setIsVisible(scrollTop > 400);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const scrollContainer = containerRef.current?.closest('.overflow-y-auto') || window;
    if (scrollContainer === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      (scrollContainer as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToTop}
              className="rounded-full w-12 h-12 bg-black/80 backdrop-blur border-primary/50 text-primary hover:bg-primary/20 hover:text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
