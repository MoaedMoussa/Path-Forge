import React, { useState, useEffect } from 'react';
import { FileText, Check } from 'lucide-react';

interface LessonNotesProps {
  lessonId: string;
}

export function LessonNotes({ lessonId }: LessonNotesProps) {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`pathforge-notes-${lessonId}`);
    if (saved) {
      setNote(saved);
    }
    setLoaded(true);
  }, [lessonId]);

  useEffect(() => {
    if (!loaded) return;

    const timer = setTimeout(() => {
      const currentSaved = localStorage.getItem(`pathforge-notes-${lessonId}`);
      if (note !== currentSaved) {
        setIsSaving(true);
        localStorage.setItem(`pathforge-notes-${lessonId}`, note);
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [note, lessonId, loaded]);

  return (
    <div className="flex flex-col min-h-[500px] border border-border bg-black/40 p-6 lg:p-8 mt-7">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="w-4 h-4" />
          <h2 className="text-xs font-mono tracking-[0.2em]">MY NOTES</h2>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-2">
          {isSaving ? (
            <span className="animate-pulse">Saving...</span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1 text-green-400">
              <Check className="w-3 h-3" /> Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <span>Auto-saves locally</span>
          )}
        </div>
      </div>
      <textarea
        className="flex-1 w-full bg-card/20 border border-border/50 rounded-md p-4 resize-y min-h-[400px] focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm font-mono text-white leading-relaxed placeholder:text-muted-foreground/40"
        placeholder="Jot down your thoughts, observations, and key takeaways here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </div>
  );
}
