import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { User as UserIcon, Loader2, Check, X, Calendar, Clock, MapPin, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../components/NotificationBell';
import { SEO } from '../components/SEO';
import { CardSkeleton, SessionSkeleton, Skeleton } from '../components/Skeleton';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [profileData, recsData, pendingData, activeData, sessionsData] = await Promise.all([
        api.getProfile(user.id),
        api.getRecommendations(user.id),
        api.getPendingRequests(user.id),
        api.getActiveConnections(user.id),
        api.getUserSessions(user.id)
      ]);

      setProfile(profileData as any);
      setRecommendations(recsData);
      setPendingRequests(pendingData);
      setActiveConnections(activeData);
      setUpcomingSessions(sessionsData.filter((s: any) => s.status === 'confirmed'));
      
      if (!(profileData as any)?.full_name) {
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data", err);
      setError(err.message || "Failed to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, navigate]);



  const handleConnect = async (targetUserId: string) => {
    if (!user) return;
    setConnecting(targetUserId);
    try {
      await api.requestMatch(user.id, targetUserId);
      setRecommendations(recs => recs.filter(r => r.profile.id !== targetUserId));
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    } finally {
      setConnecting(null);
    }
  };

  const handleMatchResponse = async (matchId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.updateMatchStatus(matchId, status);
      setPendingRequests(reqs => reqs.filter(r => r.id !== matchId));
    } catch (err) {
      console.error(err);
      alert("Failed to update match");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <SEO title="Loading Dashboard..." />
        <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="w-9 h-9 rounded-full" />
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-48 w-full rounded-3xl" />
          
          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <div className="grid md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <SessionSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p className="text-foreground/60 max-w-md mb-6">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`Dashboard | ${profile?.full_name || 'SkillSync'}`} />
      {/* Dashboard Topbar */}
      <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="text-xs text-foreground/50 font-medium">Good morning,</p>
            <h1 className="text-xl font-bold">{profile?.full_name || user?.email}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60 hover:text-foreground"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <NotificationBell />
          <button onClick={() => navigate('/profile')} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60 hover:text-foreground">
            <UserIcon className="w-5 h-5" />
          </button>
          <button onClick={() => navigate('/settings')} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60 hover:text-foreground">
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-primary to-clay rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold mb-2">Welcome to SkillSync, {profile?.full_name?.split(' ')[0] || 'Learner'}!</h2>
            <p className="opacity-90 max-w-md text-lg">
              {activeConnections.length > 0 
                ? `You have ${activeConnections.length} active connection${activeConnections.length === 1 ? '' : 's'}. Keep learning and sharing your skills!`
                : "Your matching engine is ready! Explore your recommendations below or search for new skills."}
            </p>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => navigate('/explore')} 
                className="px-8 py-3.5 bg-white text-primary rounded-2xl font-bold hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95"
              >
                Explore Skills
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white/10 skew-x-12 translate-x-16"></div>
        </div>

        {/* Active Connections */}
        {activeConnections.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Connections</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {activeConnections.map(conn => (
                <div key={conn.id} className="bg-card p-5 rounded-2xl shadow-sm border border-border flex gap-4 items-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                    {conn.profile.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{conn.profile.full_name}</h3>
                    <p className="text-sm text-foreground/60">{conn.profile.location || "Location hidden"}</p>
                  </div>
                  <button onClick={() => navigate('/messages')} className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-colors">
                    Message
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Skill Swaps
            </h2>
            <div className="space-y-4">
              {upcomingSessions.map(session => (
                <div key={session.id} className="p-8 bg-card rounded-3xl shadow-sm border border-border transition-colors duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-col shrink-0">
                        <span className="text-[10px] font-bold uppercase">{new Date(session.scheduled_at).toLocaleDateString(undefined, { month: 'short' })}</span>
                        <span className="text-xl font-bold leading-none">{new Date(session.scheduled_at).getDate()}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Session with {session.other_profile?.full_name}</h3>
                        <div className="flex items-center gap-3 text-sm text-foreground/50 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Online Session</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button onClick={() => navigate('/messages')} className="flex-1 md:flex-none px-6 py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                        Open Chat
                      </button>
                      <a 
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=SkillSync+Session+with+${session.other_profile?.full_name}&dates=${new Date(session.scheduled_at).toISOString().replace(/-|:|\.\d\d\d/g, "")}/${new Date(new Date(session.scheduled_at).getTime() + 60*60000).toISOString().replace(/-|:|\.\d\d\d/g, "")}&details=Join+your+SkillSync+video+session+here!`}
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 md:flex-none px-6 py-3 bg-card border border-border rounded-xl font-bold text-sm hover:bg-muted transition-colors text-center"
                      >
                        Add to Cal
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              New Connection Requests ({pendingRequests.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-card p-5 rounded-2xl shadow-sm border border-border flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                    {req.profiles.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{req.profiles.full_name}</h3>
                    <p className="text-sm text-foreground/60 line-clamp-1">{req.profiles.bio || "No bio provided"}</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleMatchResponse(req.id, 'accepted')} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 flex justify-center items-center gap-1">
                        <Check className="w-4 h-4" /> Accept
                      </button>
                      <button onClick={() => handleMatchResponse(req.id, 'rejected')} className="flex-1 py-2 bg-muted text-foreground/60 rounded-lg font-bold text-sm hover:bg-muted/80 flex justify-center items-center gap-1">
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Matches */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recommended For You</h2>
          {recommendations.length === 0 ? (
            <div className="bg-card p-8 rounded-3xl text-center border border-border shadow-sm">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-foreground/40" />
              </div>
              <h3 className="font-bold text-lg mb-2">No matches right now</h3>
              <p className="text-foreground/60 max-w-md mx-auto">We couldn't find anyone currently offering the skills you are seeking. Check back later or add more skills to your seeking list!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.map(rec => (
                <div key={rec.profile.id} className="bg-card p-6 rounded-3xl shadow-sm border border-border hover:shadow-md transition-all duration-300">
                  <div className="flex gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary/5 text-primary rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                      {rec.profile.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight text-foreground">{rec.profile.full_name || "SkillSync Member"}</h3>
                      <p className="text-sm text-foreground/50">{rec.profile.location || "Location hidden"}</p>
                    </div>
                  </div>
                  <p className="text-foreground/60 text-sm mb-4 line-clamp-2">
                    {rec.profile.bio || "This user hasn't written a bio yet."}
                  </p>
                  <div className="mb-6">
                    <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">They can teach you:</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.skills.map((s: any) => (
                        <span key={s.id} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleConnect(rec.profile.id)}
                    disabled={connecting === rec.profile.id}
                    className="w-full py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {connecting === rec.profile.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Connection'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
