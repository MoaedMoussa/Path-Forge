import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Button, Card } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, ThumbsUp, User } from 'lucide-react';

interface FeedbackItem {
  id: string;
  lessonId: string;
  userId: string;
  userName: string;
  text: string;
  votes: number;
  upvotedBy: string[];
  createdAt: any;
}

export function LessonFeedback({ lessonId }: { lessonId: string }) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [user, setUser] = useState(auth.currentUser);
  const [newFeedback, setNewFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!lessonId) return;
    
    const q = query(
      collection(db, 'lessonFeedback'),
      where('lessonId', '==', lessonId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: FeedbackItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as FeedbackItem);
      });
      
      // Sort client-side: highest votes first, then most recent
      items.sort((a, b) => {
        if (b.votes !== a.votes) return b.votes - a.votes;
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      setFeedback(items);
    });
    
    return unsubscribe;
  }, [lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newFeedback.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'lessonFeedback'), {
        lessonId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous Student',
        text: newFeedback.trim(),
        votes: 0,
        upvotedBy: [],
        createdAt: serverTimestamp()
      });
      setNewFeedback('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (itemId: string, upvotedBy: string[]) => {
    if (!user) return;
    
    const itemRef = doc(db, 'lessonFeedback', itemId);
    const hasVoted = upvotedBy.includes(user.uid);
    
    try {
      if (hasVoted) {
        await updateDoc(itemRef, {
          upvotedBy: arrayRemove(user.uid),
          votes: upvotedBy.length - 1
        });
      } else {
        await updateDoc(itemRef, {
          upvotedBy: arrayUnion(user.uid),
          votes: upvotedBy.length + 1
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'feedback');
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-7">
      <div className="flex items-center gap-2 text-primary">
        <MessageCircle className="w-4 h-4" />
        <h2 className="text-xs font-mono tracking-[0.2em]">COMMUNITY FEEDBACK</h2>
      </div>

      <Card className="p-6 border-border bg-black/40">
        {!user ? (
          <div className="text-center py-6 text-sm font-mono text-muted-foreground">
            Please log in to participate in the community discussion.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Textarea 
              placeholder="Ask a question, share an insight, or leave a review about this module..." 
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              className="bg-card/20 border-border/50 font-mono text-xs min-h-[100px] text-white placeholder:text-muted-foreground/40 focus-visible:ring-primary/50"
            />
            <Button 
              type="submit" 
              disabled={!newFeedback.trim() || isSubmitting}
              className="self-end"
            >
              {isSubmitting ? 'POSTING...' : 'POST FEEDBACK'}
            </Button>
          </form>
        )}
      </Card>

      <div className="flex flex-col gap-4">
        {feedback.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border/50 rounded-md text-xs font-mono text-muted-foreground">
            No feedback yet. Be the first to start the discussion!
          </div>
        ) : (
          feedback.map((item) => (
            <Card key={item.id} className="p-5 border-border bg-card/40 flex gap-4">
              <div className="flex flex-col items-center gap-1 min-w-[40px]">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 rounded-full ${user && item.upvotedBy.includes(user.uid) ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-muted-foreground hover:text-white'}`}
                  onClick={() => handleVote(item.id, item.upvotedBy)}
                  disabled={!user}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <span className={`text-xs font-mono font-bold ${user && item.upvotedBy.includes(user.uid) ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.votes}
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  <User className="w-3 h-3" />
                  {item.userName} 
                  {item.createdAt && (
                    <>
                      <span className="opacity-50">•</span>
                      <span>{new Date(item.createdAt.toDate?.() || item.createdAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
                <p className="text-sm font-mono text-white/90 leading-relaxed whitespace-pre-wrap">
                  {item.text}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
