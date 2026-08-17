import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { 
  Sparkles, Brain, Compass, Send, CheckCircle2, 
  Target, ArrowLeft, Loader2, RefreshCw, BarChart2, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { NotificationBell } from '../components/NotificationBell';

interface Message {
  sender: 'user' | 'coach';
  text: string;
  timestamp: Date;
}

interface RoadmapStep {
  id: string;
  title: string;
  duration: string;
  details: string;
  completed: boolean;
}

export const AICoach = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const [selectedSkillForRoadmap, setSelectedSkillForRoadmap] = useState<string>('');
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [roadmapSkill, setRoadmapSkill] = useState<string>('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial profile & skills
  useEffect(() => {
    if (!user) return;
    
    Promise.all([
      api.getProfile(user.id),
      api.getUserSkills(user.id)
    ])
      .then(([profileData, skillsData]) => {
        setProfile(profileData);
        setUserSkills(skillsData);
        
        // Find first seeking skill to initialize dropdown
        const seeks = skillsData.filter((us: any) => us.type === 'seeking');
        if (seeks.length > 0 && seeks[0].skills) {
          setSelectedSkillForRoadmap(seeks[0].skills.name);
        }
        
        // Welcome message
        const name = profileData?.full_name?.split(' ')[0] || 'there';
        setMessages([
          {
            sender: 'coach',
            text: `Hi ${name}! I am your AI Career & Skill Coach. I've analyzed your profile and skills swap interests. Ask me about your skill gaps, how to prepare for your swaps, or select a skill on the right to generate an interactive study roadmap.`,
            timestamp: new Date()
          }
        ]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const offeringSkills = userSkills.filter((us: any) => us.type === 'offering').map(us => us.skills?.name || 'Unknown');
  const seekingSkills = userSkills.filter((us: any) => us.type === 'seeking').map(us => us.skills?.name || 'Unknown');

  // Simulated AI response generator
  const getCoachResponse = (input: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const query = input.toLowerCase();
        
        // 1. Skill Gaps query
        if (query.includes('gap') || query.includes('what should i learn') || query.includes('analysis')) {
          if (seekingSkills.length === 0) {
            resolve(`It looks like you haven't listed any seeking skills yet. Go to your Profile settings, add skills you want to learn, and I will analyze the market gaps for those skills!`);
            return;
          }
          resolve(`Based on your goal to learn **${seekingSkills.join(', ')}**, here is your custom skill gap analysis:\n\n` + 
            `- **High Priority**: Foundational concepts and terminology for ${seekingSkills[0]}.\n` +
            `- **Medium Priority**: Interactive building blocks and hands-on exercises.\n` +
            `- **Community Recommendation**: Match with members teaching ${seekingSkills[0]} and offer your expert skill in **${offeringSkills[0] || 'your listed domains'}** as a trade!`);
          return;
        }
        
        // 2. Skill Swap Advice
        if (query.includes('swap') || query.includes('trade') || query.includes('teach') || query.includes('prepare')) {
          resolve(`To set up a successful skill swap, here is my recommendation:\n\n` +
            `1. **Create an Agenda**: Dedicate 30 mins to you teaching **${offeringSkills[0] || 'your skill'}** and 30 mins to learning **${seekingSkills[0] || 'their skill'}**.\n` +
            `2. **Use Our Integrated Jitsi video calling** in the Messages tab for a seamless sharing session.\n` +
            `3. **Set Homework**: Share one small task or resource at the end of the call to keep each other accountable.`);
          return;
        }

        // 3. Roadmap query
        if (query.includes('roadmap') || query.includes('plan') || query.includes('guide')) {
          resolve(`I can build a step-by-step roadmap for any skill you want. Use the **Roadmap Generator panel on the right**, select a skill, and click **Generate Roadmap** to create a custom track with trackable checkpoints!`);
          return;
        }

        // 4. General fallback conversational response
        resolve(`That's a great question! Developing your skills in **${seekingSkills[0] || 'new fields'}** while sharing **${offeringSkills[0] || 'your knowledge'}** is the fastest way to grow.\n\n` +
          `Is there a specific project you want to build or an upcoming session you'd like to prepare for? I'm here to help you outline the exact steps.`);
      }, 1500);
    });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp: new Date() }]);
    setIsTyping(true);

    try {
      const reply = await getCoachResponse(userMsg);
      setMessages(prev => [...prev, { sender: 'coach', text: reply, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'coach', text: 'Sorry, I encountered an issue connecting. Please try again.', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Generate Learning Roadmap
  const handleGenerateRoadmap = () => {
    if (!selectedSkillForRoadmap) return;
    
    setRoadmapSkill(selectedSkillForRoadmap);
    
    // Custom mock roadmap steps based on name
    const steps: RoadmapStep[] = [
      {
        id: '1',
        title: `Phase 1: Foundational Core of ${selectedSkillForRoadmap}`,
        duration: 'Days 1 - 5',
        details: `Focus on core theories, basic syntax/design elements, and essential vocabulary. Check out documentation and community tutorials.`,
        completed: false
      },
      {
        id: '2',
        title: `Phase 2: Building Guided Projects`,
        duration: 'Days 6 - 12',
        details: `Work with a match partner to build a tiny clone, script, or layout. Share screens using our built-in Jitsi video calling in messages.`,
        completed: false
      },
      {
        id: '3',
        title: `Phase 3: Independent Practice & Peer Reviews`,
        duration: 'Days 13 - 20',
        details: `Build a custom tool or design from scratch. Upload it to your SkillSync Portfolio and request match connections to review it.`,
        completed: false
      },
      {
        id: '4',
        title: `Phase 4: Expert Feedback Session`,
        duration: 'Day 21+',
        details: `Schedule a 1-hour swap session. Let your swap buddy review your codebase or designs and answer advanced questions.`,
        completed: false
      }
    ];

    setRoadmap(steps);
    
    // Add message to chat about it
    setMessages(prev => [...prev, {
      sender: 'coach',
      text: `I've generated a 4-phase learning roadmap for **${selectedSkillForRoadmap}**! Check it out on the right panel. You can check off milestones as you make progress.`,
      timestamp: new Date()
    }]);
  };

  // Toggle step completion
  const handleToggleStep = (stepId: string) => {
    setRoadmap(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  };

  const completedSteps = roadmap.filter(s => s.completed).length;
  const roadmapProgress = roadmap.length > 0 ? Math.round((completedSteps / roadmap.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <SEO title="Loading AI Coach..." />
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-foreground/60 font-bold">Assembling AI Coach Insights...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-8 transition-colors duration-300">
      <SEO title="AI Career Coach | SkillSync" />
      
      {/* Topbar */}
      <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            AI Career Coach
          </h1>
        </div>
        <div className="flex gap-3">
          <NotificationBell />
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Skill Gap & Insights */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
              <Brain className="w-5 h-5 text-primary" />
              Skill Assessment
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider mb-2">My Superpowers (Offering)</p>
                {offeringSkills.length === 0 ? (
                  <p className="text-xs text-foreground/50 italic">No offering skills listed.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {offeringSkills.map((s, idx) => (
                      <span key={idx} className="text-xs bg-secondary/15 text-secondary-foreground border border-secondary/20 px-2.5 py-1 rounded-full font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider mb-2">My Targets (Seeking)</p>
                {seekingSkills.length === 0 ? (
                  <p className="text-xs text-foreground/50 italic">No seeking skills listed.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {seekingSkills.map((s, idx) => (
                      <span key={idx} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
              <BarChart2 className="w-5 h-5 text-primary" />
              Market Trend
            </h2>
            <p className="text-xs text-foreground/60 leading-relaxed mb-4">
              Based on SkillSync platform activity, trading technical skills like **React** for design skills like **UI Design** has increased by **42%** this month.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground/75">Development</span>
                <span className="font-bold text-primary">Very High Demand</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-semibold text-foreground/75">Design & Creative</span>
                <span className="font-bold text-secondary-foreground">Growing</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-accent h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Chat Assistant */}
        <div className="lg:col-span-5 bg-card rounded-3xl border border-border flex flex-col h-[600px] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">Coach Gemini</h3>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">AI online</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setMessages([
                  {
                    sender: 'coach',
                    text: `Hi ${profile?.full_name?.split(' ')[0] || 'there'}! Chat history cleared. What skill gap or learning goals should we tackle next?`,
                    timestamp: new Date()
                  }
                ]);
              }}
              className="p-2 hover:bg-muted rounded-lg text-foreground/40 hover:text-foreground transition-colors"
              title="Clear Conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-muted text-foreground rounded-tl-none border border-border/20'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`block text-[9px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-white/60 text-right' : 'text-foreground/40'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-4 rounded-2xl rounded-tl-none border border-border/20 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick-reply chips */}
          <div className="px-4 py-2 border-t border-border flex gap-2 overflow-x-auto no-scrollbar bg-muted/10">
            <button 
              onClick={() => {
                setChatInput("What are my main skill gaps?");
              }}
              className="text-xs bg-card hover:bg-muted border border-border rounded-full px-3.5 py-1.5 whitespace-nowrap font-bold text-foreground/70 active:scale-95 transition-all"
            >
              🔍 Skill Gaps
            </button>
            <button 
              onClick={() => {
                setChatInput("How can I prepare for a swap session?");
              }}
              className="text-xs bg-card hover:bg-muted border border-border rounded-full px-3.5 py-1.5 whitespace-nowrap font-bold text-foreground/70 active:scale-95 transition-all"
            >
              🤝 Prep Swap Session
            </button>
            <button 
              onClick={() => {
                setChatInput("Give me a quick roadmap outline");
              }}
              className="text-xs bg-card hover:bg-muted border border-border rounded-full px-3.5 py-1.5 whitespace-nowrap font-bold text-foreground/70 active:scale-95 transition-all"
            >
              📅 Roadmap Tips
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-muted/10 flex gap-2">
            <input
              type="text"
              placeholder="Ask Coach Gemini..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-muted border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-card text-foreground placeholder:text-foreground/30"
            />
            <button 
              type="submit" 
              className="p-3 bg-primary text-white rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center shrink-0 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Roadmap Generator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
              <Compass className="w-5 h-5 text-primary" />
              Roadmap Generator
            </h2>
            <p className="text-xs text-foreground/60 leading-relaxed mb-4">
              Select one of your target skills to create a personalized, 4-phase weekly learning schedule.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-foreground/40 uppercase block mb-1.5">Select Target Skill</label>
                {seekingSkills.length === 0 ? (
                  <div className="p-3 bg-muted rounded-xl text-center text-xs text-foreground/50 italic">
                    Add seeking skills in Profile to unlock
                  </div>
                ) : (
                  <select
                    value={selectedSkillForRoadmap}
                    onChange={(e) => setSelectedSkillForRoadmap(e.target.value)}
                    className="w-full bg-muted border-none rounded-xl px-3 py-2.5 text-xs text-foreground font-semibold focus:ring-2 focus:ring-primary"
                  >
                    {seekingSkills.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>

              <button
                onClick={handleGenerateRoadmap}
                disabled={seekingSkills.length === 0}
                className="w-full py-3 bg-foreground text-background font-bold text-xs rounded-xl shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Generate Study Roadmap
              </button>
            </div>
          </div>

          {/* Generated Roadmap Checklist */}
          {roadmap.length > 0 && (
            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm animate-fade-up">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm flex items-center gap-1.5 text-foreground">
                  <Target className="w-4 h-4 text-primary" />
                  Roadmap: {roadmapSkill}
                </h3>
                <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                  {roadmapProgress}% Done
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-5">
                <div className="bg-primary h-full transition-all duration-500 rounded-full" style={{ width: `${roadmapProgress}%` }}></div>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {roadmap.map((step) => (
                  <div 
                    key={step.id} 
                    onClick={() => handleToggleStep(step.id)}
                    className={`p-3.5 border rounded-2xl cursor-pointer transition-all flex gap-3 ${
                      step.completed 
                        ? 'bg-primary/5 border-primary/20 opacity-80' 
                        : 'bg-muted/30 border-border hover:border-foreground/20'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border mt-0.5 transition-all ${
                      step.completed 
                        ? 'bg-primary border-primary text-white' 
                        : 'border-foreground/30 text-transparent'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`text-xs font-bold ${step.completed ? 'line-through text-foreground/50' : 'text-foreground'}`}>
                          {step.title}
                        </h4>
                      </div>
                      <span className="inline-block text-[9px] font-bold text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full mb-1">
                        {step.duration}
                      </span>
                      <p className="text-[10px] text-foreground/60 leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
