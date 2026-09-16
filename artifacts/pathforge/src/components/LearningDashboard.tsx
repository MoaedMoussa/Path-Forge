import { Users, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { Card, Input, Button } from '@/components/ui';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { Clock, Activity, Target, Flag, Check, Edit2, Bell } from 'lucide-react';
import { COURSE_LESSONS } from '@/data/courseContent';
import { useMemo } from 'react';







export function LearningDashboard() {
  const { summary, progress } = useCourseProgress();

  const derivedStats = useMemo(() => {
    const weeklyMap = new Map();
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toDateString();
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyMap.set(dateKey, { day: dayName, problems: 0, time: 0 });
    }

    const topicTimeMap = new Map();
    topicTimeMap.set('Linear Data', 0);
    topicTimeMap.set('Trees/Graphs', 0);
    topicTimeMap.set('Algorithms', 0);
    topicTimeMap.set('System Design', 0);
    topicTimeMap.set('Advanced', 0);

    const categoryScores = new Map();
    const allCategories = ['Linear structures', 'Algorithms', 'Trees & graphs', 'Advanced techniques', 'System Design'];
    
    for (const cat of allCategories) {
      categoryScores.set(cat, { earned: 0, max: 0 });
    }

    let totalEstimatedTime = 0;

    for (const lesson of COURSE_LESSONS) {
      const prog = progress[lesson.id];
      
      const catData = categoryScores.get(lesson.category);
      if (catData) {
        catData.max += 3;
        if (prog) {
          if (prog.completed) catData.earned += 1;
          if (prog.quizPassed) catData.earned += 1;
          if (prog.puzzleSolved) catData.earned += 1;
        }
      }

      if (!prog) continue;

      const timeEarned = (prog.completed ? 30 : 0) + (prog.quizPassed ? 15 : 0) + (prog.puzzleSolved ? 15 : 0);
      const problemsSolved = (prog.quizPassed ? 1 : 0) + (prog.puzzleSolved ? 1 : 0);

      totalEstimatedTime += timeEarned;

      if (lesson.category === 'Linear structures') topicTimeMap.set('Linear Data', topicTimeMap.get('Linear Data') + timeEarned);
      if (lesson.category === 'Trees & graphs') topicTimeMap.set('Trees/Graphs', topicTimeMap.get('Trees/Graphs') + timeEarned);
      if (lesson.category === 'Algorithms') topicTimeMap.set('Algorithms', topicTimeMap.get('Algorithms') + timeEarned);
      if (lesson.category === 'System Design') topicTimeMap.set('System Design', topicTimeMap.get('System Design') + timeEarned);
      if (lesson.category === 'Advanced techniques') topicTimeMap.set('Advanced', topicTimeMap.get('Advanced') + timeEarned);

      if (prog.lastUpdatedAt) {
        const updatedDate = new Date(prog.lastUpdatedAt).toDateString();
        if (weeklyMap.has(updatedDate)) {
          const d = weeklyMap.get(updatedDate);
          d.time += timeEarned; 
          d.problems += problemsSolved;
        }
      }
    }

    const WEEKLY_DATA = Array.from(weeklyMap.values());
    
    let ALGO_TIME_DATA = Array.from(topicTimeMap.entries()).map(([name, time]) => ({ name, time })).filter(item => item.time > 0);
    if (ALGO_TIME_DATA.length === 0) {
      ALGO_TIME_DATA = [
        { name: 'Linear Data', time: 0 },
        { name: 'Algorithms', time: 0 },
        { name: 'Trees/Graphs', time: 0 }
      ];
    }

    const SKILL_DATA = Array.from(categoryScores.entries()).map(([subject, scores]) => ({
      subject: subject.split(' ')[0],
      A: scores.max > 0 ? Math.round((scores.earned / scores.max) * 100) : 0,
      fullMark: 100
    }));

    return { WEEKLY_DATA, ALGO_TIME_DATA, SKILL_DATA, totalEstimatedTime };
  }, [progress]);

  const { WEEKLY_DATA, ALGO_TIME_DATA, SKILL_DATA, totalEstimatedTime } = derivedStats;
  const { toast } = useToast();
  const [goal, setGoal] = useState(600); // Default 600 mins
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(600);
  const [recentRooms, setRecentRooms] = useState<any[]>([]);
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    return localStorage.getItem('pathforge-reminders') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('pathforge-reminders', remindersEnabled.toString());
    
    if (remindersEnabled) {
      useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'studyRooms'), where('members', 'array-contains', auth.currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).slice(0, 3);
      setRecentRooms(rooms);
    });
    return unsub;
  }, []);

  const checkReminders = () => {
        const now = new Date();
        // Trigger at 6 PM (18:00) or later
        if (now.getHours() >= 18) {
          const lastReminder = localStorage.getItem('pathforge-last-reminder');
          const today = now.toDateString();
          
          if (lastReminder !== today) {
            // Did they study today? (Check local streak data)
            const streakData = localStorage.getItem('pathforge-academy-streak-v1');
            const parsedStreak = streakData ? JSON.parse(streakData) : null;
            
            if (!parsedStreak || parsedStreak.lastActivity !== today) {
              toast({
                title: "Daily Goal Not Met",
                description: "You haven't hit your study goal for today. Hop in and complete a lesson!",
              });
              localStorage.setItem('pathforge-last-reminder', today);
            }
          }
        }
      };
      
      checkReminders();
      const interval = setInterval(checkReminders, 60000); // Check every minute
      return () => clearInterval(interval);
    }
    return undefined;
  }, [remindersEnabled, toast]);

  
  const currentTotalTime = WEEKLY_DATA.reduce((acc, curr) => acc + curr.time, 0);
  const progressPercent = Math.min(100, Math.round((currentTotalTime / goal) * 100));


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary font-mono text-xs tracking-[0.2em] mb-4 border-b border-border/50 pb-2">
        <Activity className="w-4 h-4" /> LEARNING ANALYTICS
      </div>

            {/* Weekly Study Goal */}
      <Card className="p-5 bg-card/20 border-border mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-4 h-4 text-green-400" />
              <h3 className="font-mono text-sm text-white">WEEKLY STUDY GOAL</h3>
            </div>
            <div className="flex items-center gap-4">
              <Progress value={progressPercent} className="h-2 flex-1" />
              <div className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                <span className="text-white font-bold">{currentTotalTime}</span> / {goal} MINS
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {isEditingGoal ? (
              <>
                <Input 
                  type="number" 
                  value={tempGoal} 
                  onChange={(e) => setTempGoal(Number(e.target.value))}
                  className="w-24 h-8 text-xs font-mono bg-black/40 border-border"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => { setGoal(tempGoal); setIsEditingGoal(false); }}
                  className="h-8 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                >
                  <Check className="w-3 h-3 mr-1" /> SAVE
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsEditingGoal(true)}
                className="h-8 border-border/50 text-muted-foreground hover:text-white"
              >
                <Edit2 className="w-3 h-3 mr-1" /> SET GOAL
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-4">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <div>
              <h4 className="text-xs font-mono text-white">Evening Study Reminders</h4>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Notifies you if your daily goal isn't met by 6:00 PM</p>
            </div>
          </div>
          <Switch 
            checked={remindersEnabled}
            onCheckedChange={setRemindersEnabled}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Consistency Chart */}
        <Card className="p-5 bg-card/20 border-border lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> WEEKLY CONSISTENCY
            </h3>
            <span className="text-[10px] text-muted-foreground tracking-widest font-mono uppercase bg-black/40 px-2 py-1 rounded">Last 7 Days</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area type="monotone" dataKey="time" name="Minutes" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorTime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Radar Chart */}
        <Card className="p-5 bg-card/20 border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-sm text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-400" /> PROFICIENCY
            </h3>
          </div>
          <div className="h-[250px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILL_DATA}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Student" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>


      {/* Recent Study Rooms Widget */}
      {recentRooms.length > 0 && (
        <Card className="p-5 bg-card/20 border-border lg:col-span-3 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" /> RECENT STUDY ROOMS
            </h3>
            <Link href="/study-groups">
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-mono text-muted-foreground hover:text-white">
                VIEW ALL <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentRooms.map(room => (
              <Link key={room.id} href={`/study-groups/${room.id}`}>
                <div className="border border-border/50 bg-black/40 hover:bg-black/60 hover:border-primary/50 transition-colors p-4 rounded-lg cursor-pointer group">
                  <h4 className="font-mono font-bold text-sm text-white truncate mb-1 group-hover:text-primary transition-colors">{room.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-mono text-muted-foreground">{room.createdAt?.toDate ? formatDistanceToNow(room.createdAt.toDate(), { addSuffix: true }) : 'Recently'}</span>
                    <span className="text-[10px] font-mono text-primary/70">{room.roomCode}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    
        {/* Time Spent Per Algorithm */}
        <Card className="p-5 bg-card/20 border-border lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" /> FOCUS TIME PER TOPIC
            </h3>
            <span className="text-[10px] text-muted-foreground tracking-widest font-mono uppercase bg-black/40 px-2 py-1 rounded">All Time (Minutes)</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ALGO_TIME_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px', fontFamily: 'monospace' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="time" name="Minutes" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
