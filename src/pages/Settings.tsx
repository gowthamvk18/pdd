import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Eye, EyeOff, Bell, LogOut, ChevronRight, Loader2, Mail, Lock, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      api.getProfile(user.id)
        .then(data => {
          setProfile(data);
          setLoading(false);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleTogglePrivacy = async (key: 'is_public' | 'show_location') => {
    if (!user || !profile) return;
    setUpdating(true);
    try {
      const newValue = !profile[key];
      await api.updatePrivacySettings(user.id, { [key]: newValue });
      setProfile({ ...profile, [key]: newValue });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = () => {
    supabase.auth.signOut().then(() => navigate('/'));
  };

  const [showSoon, setShowSoon] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-md z-40 px-6 py-6 flex items-center gap-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8">
        
        {/* Privacy Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-foreground/40 uppercase tracking-wider ml-2">Privacy & Visibility</h2>
          <div className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border">
            <div className="p-6 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  {profile.is_public ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold">Public Profile</p>
                  <p className="text-xs text-foreground/50">Allow others to find you in Explore</p>
                </div>
              </div>
              <button 
                onClick={() => handleTogglePrivacy('is_public')}
                disabled={updating}
                className={`w-12 h-6 rounded-full transition-colors relative ${profile.is_public ? 'bg-primary' : 'bg-foreground/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${profile.is_public ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Show Location</p>
                  <p className="text-xs text-foreground/50">Show your city/neighborhood to matches</p>
                </div>
              </div>
              <button 
                onClick={() => handleTogglePrivacy('show_location')}
                disabled={updating}
                className={`w-12 h-6 rounded-full transition-colors relative ${profile.show_location ? 'bg-primary' : 'bg-foreground/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${profile.show_location ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-foreground/40 uppercase tracking-wider ml-2">Account</h2>
          <div className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border">
            <button 
              onClick={() => setShowSoon('Email update')}
              className="w-full p-6 flex items-center justify-between hover:bg-muted transition-colors border-b border-border"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Email Address</p>
                  <p className="text-xs text-foreground/50">{user?.email}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-foreground/20" />
            </button>
            
            <button 
              onClick={() => setShowSoon('Password & Security settings')}
              className="w-full p-6 flex items-center justify-between hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Security</p>
                  <p className="text-xs text-foreground/50">Change password and 2FA</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-foreground/20" />
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-foreground/40 uppercase tracking-wider ml-2">Notifications</h2>
          <div className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border">
            <button 
              onClick={() => setShowSoon('Notification preferences')}
              className="w-full p-6 flex items-center justify-between hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Alert Preferences</p>
                  <p className="text-xs text-foreground/50">Push, Email, and In-app notifications</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-foreground/20" />
            </button>
          </div>
        </section>

        {/* Logout */}
        <button 
          onClick={handleSignOut}
          className="w-full p-6 bg-red-500/10 text-red-500 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors mt-8"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>

        <p className="text-center text-[10px] text-foreground/30 font-medium pb-10">
          SkillSync v1.0.0 • Made with ❤️ for lifelong learners
        </p>
      </div>

      {/* Coming Soon Modal */}
      {showSoon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-border animate-fade-up">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Coming Soon!</h3>
            <p className="text-foreground/60 mb-6">{showSoon} will be available in the next update.</p>
            <button 
              onClick={() => setShowSoon(null)}
              className="w-full py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
