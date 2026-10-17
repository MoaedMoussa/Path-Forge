import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaDescription } from '@/hooks/useMetaDescription';
import React, { useState, useEffect, useRef } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { db, auth, googleAuthProvider, OperationType, handleFirestoreError, getAuthErrorMessage } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { ArrowLeft, Send, Users, Code2, Terminal, Play, LogIn, Link as LinkIcon, Check, Trophy, Pin, PinOff, Image as ImageIcon, X, SmilePlus, Bot, Video, ExternalLink } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-tomorrow.css';
import { CollaborativeCanvas } from '@/components/CollaborativeCanvas';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { COURSE_LESSONS } from '@/data/courseContent';

type Language = 'javascript' | 'python' | 'java' | 'cpp';

export default function StudyRoom() {
  const [, params] = useRoute('/study-groups/:roomId');
  const [, setLocation] = useLocation();
  const roomId = params?.roomId;
  
  const [user, setUser] = useState(auth.currentUser);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  usePageTitle(room ? `Room: ${room.name}` : 'Study Room');
  useMetaDescription(room ? `Join the ${room.name} study session on PathForge Academy.` : 'Collaborative Study Room');
  
  const [selectedChallenge, setSelectedChallenge] = useState<string>(COURSE_LESSONS[0].id);
  
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<Language>('javascript');
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('chat');
  const [sessionLog, setSessionLog] = useState<{ id: string, message: string, time: Date }[]>([]);
  const prevMembersRef = useRef<string[]>([]);
  
  useEffect(() => {
    if (!room) return;
    const currentMembers = room.members || [];
    const newMembers = currentMembers.filter((m: string) => !prevMembersRef.current.includes(m));
    
    if (prevMembersRef.current.length > 0) {
      newMembers.forEach((m: string) => {
         const profile = room.participantDetails?.[m];
         const name = profile?.displayName || 'User ' + m.substring(0, 4);
         setSessionLog(prev => [...prev, { id: Math.random().toString(), message: `${name} joined the room.`, time: new Date() }]);
      });
    } else if (currentMembers.length > 0 && sessionLog.length === 0) {
       setSessionLog([{ id: 'init', message: 'Session connected. Log started.', time: new Date() }]);
    }
    prevMembersRef.current = currentMembers;
  }, [room?.members]);

  const [copiedLink, setCopiedLink] = useState(false);



  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<any>(null);
  const pendingCodeRef = useRef<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 800;

        if (width > height && width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        setImagePreview(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };


  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthInitialized(true);
    });
    return unsubscribe;
  }, []);

  // Flush pending changes on unmount or unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingCodeRef.current !== null && roomId && user) {
        updateDoc(doc(db, 'studyRooms', roomId!), {
          codeSnippet: pendingCodeRef.current,
          updatedAt: serverTimestamp()
        }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [roomId, user]);

  // Sync Room State (Code + Metadata)
  useEffect(() => {
    if (!roomId || !user) return;
    
    const roomRef = doc(db, 'studyRooms', roomId!);
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRoom(data);
        
        if (data.banned && data.banned.includes(user.uid)) {
          setLocation('/study-groups');
          return;
        }
        
        if (data.creatorId !== user.uid && data.kickedAt && data.kickedAt[user.uid] && data.kickedAt[user.uid] > (data.joinedAt?.[user.uid] || 0)) {
          setLocation('/study-groups');
          return;
        }

        if (data.members && !data.members.includes(user.uid)) {
          import('firebase/firestore').then(({ arrayUnion }) => {
            updateDoc(roomRef, {
              members: arrayUnion(user.uid),
              [`participantDetails.${user.uid}`]: {
                uid: user.uid,
                displayName: user.displayName || 'User ' + user.uid.substring(0, 4),
                photoURL: user.photoURL || ''
              },
              updatedAt: serverTimestamp()
            }).catch(e => handleFirestoreError(e, OperationType.UPDATE, 'studyRooms'));
          });
        } else if (data.members && data.members.includes(user.uid) && (!data.participantDetails || !data.participantDetails[user.uid])) {
          updateDoc(roomRef, {
            [`participantDetails.${user.uid}`]: {
              uid: user.uid,
              displayName: user.displayName || 'User ' + user.uid.substring(0, 4),
              photoURL: user.photoURL || ''
            }
          }).catch(e => {});
        }
        
        if (pendingCodeRef.current === null) {
          setCode(data.codeSnippet || '');
          setLanguage((data.language as Language) || 'javascript');
        }
      } else {
        setLocation('/study-groups');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.READ, `studyRooms/${roomId}`);
    });
    
    return unsubscribeRoom;
  }, [roomId, user, setLocation]);

  // Sync Chat Messages
  useEffect(() => {
    if (!roomId || !user) return;
    const q = query(
      collection(db, 'studyRooms', roomId!, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgData);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      console.warn("Messages listener:", error.message);
    });
    return unsubscribe;
  }, [roomId, user]);

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

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    pendingCodeRef.current = newCode;
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'studyRooms', roomId!), {
          codeSnippet: newCode,
          updatedAt: serverTimestamp()
        });
        pendingCodeRef.current = null;
        debounceTimer.current = null;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `studyRooms/${roomId}`);
      }
    }, 1000);
  };

  const handleEditorBlur = () => {
    if (pendingCodeRef.current !== null && roomId && user) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
      updateDoc(doc(db, 'studyRooms', roomId!), {
        codeSnippet: pendingCodeRef.current,
        updatedAt: serverTimestamp()
      }).catch(() => {});
      pendingCodeRef.current = null;
    }
  };

  const handleKickMember = async (memberId: string) => {
    if (!roomId || !user || user.uid !== room.creatorId) return;
    try {
      const roomRef = doc(db, 'studyRooms', roomId);
      import('firebase/firestore').then(({ arrayUnion, arrayRemove }) => {
        updateDoc(roomRef, {
          members: arrayRemove(memberId),
          banned: arrayUnion(memberId),
          updatedAt: serverTimestamp()
        });
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'studyRooms');
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    if (!roomId || !user) return;
    try {
      await updateDoc(doc(db, 'studyRooms', roomId!), {
        language: newLang,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `studyRooms/${roomId}`);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imagePreview) || !roomId || !user) return;
    
    const text = newMessage.trim();
    const imgData = imagePreview;
    
    setNewMessage('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    try {
      await addDoc(collection(db, 'studyRooms', roomId!, 'messages'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous Engineer',
        text,
        imageUrl: imgData || null,
        reactions: {},
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `studyRooms/${roomId}/messages`);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string, currentReactions: Record<string, string[]> = {}) => {
    if (!roomId || !user) return;
    try {
      const userReactions = currentReactions[emoji] || [];
      const hasReacted = userReactions.includes(user.uid);
      
      let newEmojiReactions;
      if (hasReacted) {
        newEmojiReactions = userReactions.filter(id => id !== user.uid);
      } else {
        newEmojiReactions = [...userReactions, user.uid];
      }

      const updatedReactions = { ...currentReactions, [emoji]: newEmojiReactions };
      if (newEmojiReactions.length === 0) {
        delete updatedReactions[emoji];
      }

      await updateDoc(doc(db, 'studyRooms', roomId, 'messages', messageId), {
        reactions: updatedReactions
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'messages');
    }
  };

  const togglePinMessage = async (messageId: string, currentPinned: boolean) => {
    if (!roomId) return;
    try {
      await updateDoc(doc(db, 'studyRooms', roomId, 'messages', messageId), {
        pinned: !currentPinned
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'messages');
    }
  };

  const loadChallenge = () => {
    const challenge = COURSE_LESSONS.find(c => c.id === selectedChallenge);
    if (!challenge) return;
    const starter = `/*\n * Challenge: ${challenge.title}\n * ${challenge.description}\n * \n * Prompt: ${challenge.interviewPrompt}\n */\n\nfunction solve() {\n  // Write your solution here\n}\n`;
    handleCodeChange(starter);
  };

  const executeCode = () => {
    setOutput([]);
    setError(null);
    if (language !== 'javascript') {
      setOutput([
        `[Environment Info]`,
        `Local browser execution is currently only supported for JavaScript.`,
        `To execute ${language}, please connect a backend code execution engine.`
      ]);
      return;
    }
    try {
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      const func = new Function(code);
      func();
      console.log = originalConsoleLog;
      if (logs.length === 0) setOutput(['[Execution finished with no output]']);
      else setOutput(logs);
    } catch (err: any) {
      setError(err.toString());
    }
  };

  if (!authInitialized) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-muted-foreground animate-pulse">
        INITIALIZING...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40">
        <Users className="w-16 h-16 text-primary/50 mb-6" />
        <h1 className="text-3xl font-mono font-bold tracking-tight mb-2">JOIN SESSION</h1>
        <p className="text-muted-foreground font-mono max-w-md text-center mb-8">
          You need to be authenticated to join this collaborative study room.
        </p>
        {loginError && <div role="alert" className="max-w-lg mb-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-left text-sm text-red-200">{loginError}</div>}
        <Button onClick={handleLogin} disabled={isSigningIn} size="lg" className="font-mono tracking-widest gap-3">
          <LogIn className="w-4 h-4" /> {isSigningIn ? 'CONNECTING...' : 'SIGN IN TO JOIN'}
        </Button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-muted-foreground animate-pulse">
        CONNECTING TO SESSION...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/40 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/study-groups">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-mono font-bold text-sm leading-tight text-white">{room.name}</h1>
            <p className="font-mono text-[10px] tracking-widest text-primary uppercase">ROOM ACTIVE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <PomodoroTimer />
          </div>
          {room.roomCode && (
            <div className="hidden sm:flex items-center text-[10px] font-mono text-muted-foreground bg-black/40 px-3 py-1.5 rounded border border-border/50 select-all">
              CODE: {room.roomCode}
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(`https://meet.jit.si/PathForge-StudyGroup-${roomId}`, '_blank')}
            className="h-7 text-[10px] font-mono gap-1 bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/20 hover:text-violet-200"
            title="Join Video Meeting"
          >
            <Video className="w-3 h-3" />
            <span className="hidden sm:inline">JOIN CALL</span>
          </Button>

          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyInviteLink}
            className="h-7 text-[10px] font-mono gap-1"
          >
            {copiedLink ? <Check className="w-3 h-3 text-green-400" /> : <LinkIcon className="w-3 h-3" />}
            {copiedLink ? 'COPIED' : 'INVITE'}
          </Button>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-black/40 px-3 py-1.5 rounded-full border border-border/50 ml-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border">
        
        
        {/* Participants Sidebar (Visible to Owner) */}
        {user.uid === room.creatorId && (
          <div className="w-full lg:w-48 xl:w-56 bg-card/20 shrink-0 flex flex-col hidden lg:flex border-r border-border">
            <div className="p-3 border-b border-border bg-black/40 flex items-center gap-2 text-primary">
              <Users className="w-4 h-4" />
              <h2 className="text-xs font-mono tracking-widest font-bold">PARTICIPANTS</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {room.members?.map((memberId: string) => {
                const profile = room.participantDetails?.[memberId];
                const isMe = memberId === user.uid;
                const displayName = profile?.displayName || 'User ' + memberId.substring(0, 4);
                
                return (
                  <div key={memberId} className="flex items-center justify-between p-2 rounded bg-black/20 hover:bg-black/40 group border border-transparent hover:border-border/50 transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                      <span className="text-[10px] font-mono text-muted-foreground truncate" title={displayName}>
                        {isMe ? 'YOU (Owner)' : displayName}
                      </span>
                    </div>
                    {!isMe && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-5 h-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => handleKickMember(memberId)}
                        title="Kick Participant"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collaborative Editor */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#1d1f21]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-black/40 px-4 py-3 gap-3 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-primary">
                <Code2 className="w-4 h-4" />
                <h2 className="text-xs font-mono tracking-[0.2em] hidden sm:inline-block">SHARED EDITOR</h2>
              </div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="flex items-center bg-black/40 rounded border border-border/50 overflow-hidden text-[10px] font-mono">
                {(['javascript', 'python', 'java', 'cpp'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1.5 transition-colors ${
                      language === lang 
                        ? 'bg-primary/20 text-primary border-b-2 border-primary' 
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white border-b-2 border-transparent'
                    }`}
                  >
                    {lang === 'javascript' ? 'JS/TS' : lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 self-end sm:self-auto">
              
              <Button size="sm" variant="outline" onClick={() => window.open('https://gemini.google.com/app', '_blank')} className="h-8 text-[10px] border-border/50 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30">
                <ExternalLink className="w-3 h-3 mr-2" /> ASK GEMINI
              </Button>

              <Button size="sm" onClick={executeCode} className="h-8 text-[10px]">
                <Play className="w-3 h-3 mr-2" /> RUN CODE
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto relative font-mono text-sm">
            <Editor
              value={code}
              onValueChange={handleCodeChange}
              onBlur={handleEditorBlur}
              highlight={c => Prism.highlight(c, Prism.languages[language] || Prism.languages.javascript, language)}
              padding={16}
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 13,
                minHeight: '100%',
                backgroundColor: 'transparent'
              }}
              textareaClassName="focus:outline-none"
            />
          </div>

          {/* Console Output */}
          <div className="h-48 border-t border-border bg-black/60 p-4 font-mono text-xs overflow-y-auto shrink-0">
            <div className="flex items-center gap-2 text-muted-foreground/60 mb-2 uppercase tracking-widest text-[10px]">
              <Terminal className="w-3 h-3" /> Console Output
            </div>
            {error ? (
              <div className="text-red-400 whitespace-pre-wrap">{error}</div>
            ) : output.length > 0 ? (
              <div className={`whitespace-pre-wrap flex flex-col gap-1 ${language !== 'javascript' ? 'text-amber-300' : 'text-green-300'}`}>
                {output.map((line, i) => (
                  <span key={i}>&gt; {line}</span>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground/40 italic">Run code to see output across the session...</div>
            )}
          </div>
        </div>

        {/* Right Panel (Tabs) */}
        <div className="h-96 lg:h-auto lg:w-[400px] flex flex-col bg-card/20 shrink-0 border-t lg:border-t-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="px-4 pt-3 pb-2 bg-black/40 border-b border-border shrink-0">
              <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-border/50 h-8">
                <TabsTrigger value="chat" className="text-[10px] font-mono tracking-widest data-[state=active]:bg-primary/20 data-[state=active]:text-primary">CHAT</TabsTrigger>
                <TabsTrigger value="canvas" className="text-[10px] font-mono tracking-widest data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">BOARD</TabsTrigger>
                <TabsTrigger value="challenge" className="text-[10px] font-mono tracking-widest data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">TASKS</TabsTrigger>
                <TabsTrigger value="log" className="text-[10px] font-mono tracking-widest data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">LOG</TabsTrigger>
              </TabsList>
            </div>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0 border-none outline-none data-[state=active]:flex">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground font-mono text-xs p-4">
                    No messages yet. Start the discussion!
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col group ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {msg.userId !== user?.uid && msg.pinned && <Pin className="w-3 h-3 text-amber-400" />}
                        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                          {msg.userId === user?.uid ? 'YOU' : msg.userName}
                        </span>
                        {msg.userId === user?.uid && msg.pinned && <Pin className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="flex items-center gap-2 relative">
                        {msg.userId === user?.uid && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                             <div className="flex bg-black/80 rounded border border-border/50 p-1 gap-1">
                               {['👍', '❤️', '😂', '💡'].map(emoji => (
                                 <button key={emoji} onClick={() => toggleReaction(msg.id, emoji, msg.reactions)} className="hover:bg-white/20 rounded px-1 transition-colors text-xs">{emoji}</button>
                               ))}
                             </div>
                             <button onClick={() => togglePinMessage(msg.id, msg.pinned)} className="p-1 hover:text-amber-400 text-muted-foreground">
                               {msg.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                             </button>
                          </div>
                        )}
                        <div className={`px-3 py-2 rounded-md max-w-[85%] text-sm flex flex-col gap-2 ${
                          msg.userId === user?.uid 
                            ? (msg.pinned ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-tr-none' : 'bg-primary text-primary-foreground rounded-tr-none')
                            : (msg.pinned ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-tl-none' : 'bg-black/40 border border-border/50 text-foreground rounded-tl-none')
                        }`}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Shared" className="max-w-full rounded-sm max-h-48 object-contain bg-black/20" />
                          )}
                          {msg.text && <span>{msg.text}</span>}
                        </div>
                        {msg.userId !== user?.uid && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                             <button onClick={() => togglePinMessage(msg.id, msg.pinned)} className="p-1 hover:text-amber-400 text-muted-foreground">
                               {msg.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                             </button>
                             <div className="flex bg-black/80 rounded border border-border/50 p-1 gap-1">
                               {['👍', '❤️', '😂', '💡'].map(emoji => (
                                 <button key={emoji} onClick={() => toggleReaction(msg.id, emoji, msg.reactions)} className="hover:bg-white/20 rounded px-1 transition-colors text-xs">{emoji}</button>
                               ))}
                             </div>
                          </div>
                        )}
                      </div>
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${msg.userId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                           {Object.entries(msg.reactions).map(([emoji, users]) => {
                              const uArray = users as string[];
                              if (uArray.length === 0) return null;
                              const hasReacted = uArray.includes(user?.uid || '');
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji, msg.reactions)}
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${hasReacted ? 'bg-primary/20 border-primary/50 text-primary-foreground' : 'bg-black/40 border-border/50 text-muted-foreground'}`}
                                >
                                  <span>{emoji}</span> <span>{uArray.length}</span>
                                </button>
                              )
                           })}
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-border bg-black/20 shrink-0 flex flex-col gap-2">
                {imagePreview && (
                  <div className="relative self-start">
                    <img src={imagePreview} alt="Preview" className="max-h-24 rounded border border-border/50 object-contain" />
                    <button 
                      onClick={() => {
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute -top-2 -right-2 bg-black border border-border rounded-full p-0.5 hover:bg-muted"
                    >
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                )}
                <form onSubmit={sendMessage} className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="shrink-0 h-9 w-9 border-border/50 bg-black/40"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Message group..."
                    className="font-mono text-sm bg-black/40 border-border/50 h-9"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim() && !imagePreview} className="shrink-0 h-9 w-9">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Canvas Tab */}
            <TabsContent value="canvas" className="flex-1 flex flex-col min-h-0 m-0 border-none outline-none data-[state=active]:flex">
              <CollaborativeCanvas roomId={roomId!} />
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenge" className="flex-1 flex flex-col min-h-0 m-0 border-none outline-none data-[state=active]:flex">
              <div className="flex-1 overflow-y-auto p-5">
                <h3 className="font-mono text-sm text-white mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-violet-400"/> ALGORITHMIC TASKS</h3>
                <p className="text-xs font-mono text-muted-foreground mb-6">Load a curriculum challenge into the shared editor to solve it together.</p>
                
                <div className="space-y-4">
                  <select 
                    value={selectedChallenge} 
                    onChange={e => setSelectedChallenge(e.target.value)}
                    className="w-full h-9 rounded border border-border bg-black/50 px-3 text-sm font-mono text-white focus:outline-none focus:border-violet-500"
                  >
                    {COURSE_LESSONS.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  
                  {(() => {
                    const challenge = COURSE_LESSONS.find(c => c.id === selectedChallenge);
                    if (!challenge) return null;
                    return (
                      <Card className="p-4 border-violet-500/30 bg-violet-500/10">
                        <Badge variant="outline" className="text-[9px] text-violet-400 border-violet-400/30 mb-2">PROMPT</Badge>
                        <p className="text-sm font-mono text-violet-100 leading-relaxed mb-4">{challenge.interviewPrompt}</p>
                        <Button onClick={loadChallenge} className="w-full bg-violet-500 text-white hover:bg-violet-600 font-mono text-[10px] tracking-widest">
                          LOAD STARTER CODE
                        </Button>
                      </Card>
                    );
                  })()}
                </div>
              </div>
            </TabsContent>

            {/* Session Log Tab */}
            <TabsContent value="log" className="flex-1 flex flex-col min-h-0 m-0 border-none outline-none data-[state=active]:flex">
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-sm text-white flex items-center gap-2">SESSION LOG</h3>
                  <Button size="sm" variant="outline" onClick={() => setSessionLog(prev => [...prev, { id: Math.random().toString(), message: `Manual timestamp marked`, time: new Date() }])} className="h-7 text-[10px] border-border/50 text-amber-400 hover:text-amber-300 hover:bg-amber-950/30">
                    MARK TIME
                  </Button>
                </div>
                <p className="text-xs font-mono text-muted-foreground mb-4">Local events and shared coordination timestamps for this session.</p>
                
                <div className="space-y-2">
                  {sessionLog.map((log) => (
                    <div key={log.id} className="text-xs font-mono p-2 rounded bg-black/40 border border-border/50 flex flex-col gap-1">
                      <span className="text-amber-500/80 text-[10px]">{log.time.toLocaleTimeString()}</span>
                      <span className="text-muted-foreground">{log.message}</span>
                    </div>
                  ))}
                  {sessionLog.length === 0 && (
                    <div className="text-center text-muted-foreground text-xs mt-8">No events logged yet.</div>
                  )}
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      
</div>
    </div>
  );
}
