import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaDescription } from '@/hooks/useMetaDescription';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { db, auth, googleAuthProvider, handleFirestoreError, OperationType, getAuthErrorMessage } from '@/lib/firebase';
import { collection, query, onSnapshot, serverTimestamp, where, getDocs, limit, doc, setDoc, getDoc, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { Button, Input } from '@/components/ui';
import { COURSE_LESSONS } from '@/data/courseContent';
import { Users, Plus, LogIn, Code2, ArrowRight, Hash, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function StudyGroups() {
  usePageTitle('Study Groups');
  useMetaDescription('Join real-time collaborative Study Groups. Code and visualize algorithms together on a shared whiteboard.');

  const [user, setUser] = useState(auth.currentUser);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Create room state
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>(COURSE_LESSONS[0].id);
  
  // Join room state
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthInitialized(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const q = query(collection(db, 'studyRooms'), where('members', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setRooms(roomData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'studyRooms');
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleLogin = async () => {
    setLoginError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError(getAuthErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newRoomName.trim()) return;

    try {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const docRef = doc(db, 'studyRooms', roomCode);
      await setDoc(docRef, {
        name: newRoomName.trim(),
        courseId: selectedCourse,
        creatorId: user.uid,
        codeSnippet: '// Write code together here...\n',
        language: 'javascript',
        roomCode,
        members: [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setLocation(`/study-groups/${roomCode}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'studyRooms');
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    setJoinError('');
    
    try {
      const docRef = doc(db, 'studyRooms', joinCode.trim().toUpperCase());
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        setLocation(`/study-groups/${snapshot.id}`);
        return;
      }
      
      setJoinError('Room not found. Check the code and try again.');
    } catch (error) {
      handleFirestoreError(error, OperationType.READ, 'studyRooms');
      setJoinError('Failed to search for room.');
    } finally {
      setIsJoining(false);
    }
  };

  if (!authInitialized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40">
        <h1 className="text-xl font-mono font-bold tracking-tight mb-2 text-muted-foreground animate-pulse">AUTHENTICATING...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40">
        <Users className="w-16 h-16 text-primary/50 mb-6" />
        <h1 className="text-3xl font-mono font-bold tracking-tight mb-2">STUDY GROUPS</h1>
        <p className="text-muted-foreground font-mono max-w-md text-center mb-8">
          Join collaborative virtual rooms to discuss problems, share progress, and pair-program in real-time.
        </p>
        {loginError && <div role="alert" className="max-w-lg mb-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-left text-sm text-red-200">{loginError}</div>}
        <Button onClick={handleLogin} disabled={isSigningIn} size="lg" className="font-mono tracking-widest gap-3">
          <LogIn className="w-4 h-4" /> {isSigningIn ? 'CONNECTING...' : 'AUTHENTICATE TO JOIN'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-black/20">
      {/* Sidebar */}
      <div className="w-full md:w-80 border-r border-border/50 bg-card/30 p-6 flex flex-col gap-8 overflow-y-auto">
        
        {/* Join by Code */}
        <div>
          <h2 className="text-lg font-mono font-bold flex items-center gap-2 mb-1 text-primary">
            <Hash className="w-4 h-4" /> JOIN BY CODE
          </h2>
          <p className="text-xs font-mono text-muted-foreground mb-4">Enter a 6-character room code</p>
          
          <form onSubmit={handleJoinByCode} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input 
                placeholder="e.g. X7B9K2" 
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                className="font-mono text-sm bg-black/40 border-border/50 uppercase"
                maxLength={10}
                required
              />
              <Button type="submit" disabled={!joinCode.trim() || isJoining} size="icon" className="shrink-0">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            {joinError && <p className="text-xs text-red-400 font-mono mt-1">{joinError}</p>}
          </form>
        </div>

        <div className="h-px w-full bg-border/50" />

        {/* Create Room */}
        <div>
          <h2 className="text-lg font-mono font-bold flex items-center gap-2 mb-1 text-primary">
            <Plus className="w-4 h-4" /> NEW ROOM
          </h2>
          <p className="text-xs font-mono text-muted-foreground mb-4">Start a new collaborative session</p>

          <form onSubmit={createRoom} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-muted-foreground">ROOM NAME</label>
              <Input 
                placeholder="e.g. A* Pathfinding Deep Dive" 
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                className="font-mono text-sm bg-black/40 border-border/50"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-muted-foreground">TOPIC / MODULE</label>
              <select 
                className="flex h-10 w-full rounded-md border border-border/50 bg-black/40 px-3 py-2 text-sm font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
              >
                {COURSE_LESSONS.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={!newRoomName.trim()} className="mt-2 font-mono tracking-widest text-xs">
              INITIALIZE SESSION
            </Button>
          </form>
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-mono font-bold tracking-tight text-white flex items-center gap-2">RECENT SESSIONS <span className="text-[10px] font-normal tracking-widest text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded">SAVED</span></h1>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="border border-border/50 bg-card/20 rounded-lg p-5 flex flex-col h-32 gap-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-primary/20" />
                    <Skeleton className="h-3 w-1/3 bg-primary/10" />
                  </div>
                  <Skeleton className="h-6 w-12 bg-black/50" />
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <Skeleton className="h-3 w-16 bg-muted/20" />
                  <Skeleton className="h-8 w-16 bg-primary/20" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="border border-dashed border-border/50 rounded-lg p-12 text-center bg-black/20">
            <Code2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-mono text-lg mb-2 text-white">NO RECENT SESSIONS</h3>
            <p className="font-mono text-xs text-muted-foreground">Be the first to create a study group.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map(room => {
              const course = COURSE_LESSONS.find(c => c.id === room.courseId);
              return (
                <div key={room.id} className="border border-border/50 bg-card/40 rounded-lg p-5 flex flex-col hover:border-primary/50 transition-colors group relative">
                  <div className="mb-4 pr-16">
                    <h3 className="font-mono font-bold text-lg mb-1 truncate" title={room.name}>{room.name}</h3>
                    <p className="font-mono text-[10px] text-primary tracking-widest uppercase">
                      {course ? course.title : 'General Study'}
                    </p>
                  </div>
                  {room.roomCode && (
                    <div className="absolute top-5 right-5 text-[10px] font-mono tracking-widest bg-black/50 px-2 py-1 rounded text-muted-foreground">
                      {room.roomCode}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {room.createdAt?.toDate ? formatDistanceToNow(room.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </span>
                    <Link href={`/study-groups/${room.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-[10px] gap-2 font-mono group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        JOIN <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
