import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { User as UserIcon, LogOut, Loader2, Search, ArrowLeft, MapPin, Star, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../components/NotificationBell';
import { CardSkeleton, Skeleton } from '../components/Skeleton';
import { SEO } from '../components/SEO';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'rating'>('newest');
  
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const categories = ['All', 'Programming', 'Design', 'Languages', 'Music', 'Art', 'Cooking', 'Fitness'];

  useEffect(() => {
    if (user) {
      fetchUsers('');
    }
  }, [user]);

  const fetchUsers = async (query: string) => {
    if (!user) return;
    setSearching(true);
    try {
      const data = await api.exploreUsers(user.id, query);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchUsers(searchQuery);
  };

  const filteredResults = results
    .filter(u => {
      const matchesCategory = selectedCategory === 'All' || u.skills.some((s: any) => s.category === selectedCategory);
      const matchesLocation = !locationQuery || u.profile.location?.toLowerCase().includes(locationQuery.toLowerCase());
      return matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.profile.rating || 0) - (a.profile.rating || 0);
      }
      return new Date(b.profile.created_at).getTime() - new Date(a.profile.created_at).getTime();
    });

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  const handleConnect = async (targetUserId: string) => {
    if (!user) return;
    setConnecting(targetUserId);
    try {
      await api.requestMatch(user.id, targetUserId);
      setSentRequests(prev => new Set(prev).add(targetUserId));
      // Remove from results or just update button state
    } catch (err) {
      console.error(err);
      alert("Failed to send request or request already exists");
    } finally {
      setConnecting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Exploring Skills..." />
        <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="w-9 h-9 rounded-full" />
          </div>
        </div>
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <div className="flex gap-2 overflow-hidden">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />)}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Topbar */}
      <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold hidden sm:block">Explore Skills</h1>
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
          <button onClick={handleSignOut} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        
        {/* Search Header */}
        <div className="bg-card p-8 rounded-3xl shadow-sm border border-border text-center transition-colors duration-300">
          <h2 className="text-3xl font-display font-bold mb-4">Find New Skills to Learn</h2>
          <p className="text-foreground/60 mb-6 max-w-lg mx-auto">
            Search for specific skills you want to learn, or browse what others in the community are offering.
          </p>
          
          <form onSubmit={handleSearch} className="space-y-4 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search skills or keywords..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-24 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-card transition-all text-lg text-foreground placeholder:text-foreground/30"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter by city..." 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-card transition-all text-sm text-foreground"
                />
              </div>
              <div className="relative flex-1">
                <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-11 pr-4 py-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-card transition-all text-sm appearance-none text-foreground"
                >
                  <option value="newest">Sort by: Newest</option>
                  <option value="rating">Sort by: Rating</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-card text-foreground/60 hover:bg-muted border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {searchQuery ? `Search Results (${filteredResults.length})` : `All Connections (${filteredResults.length})`}
          </h2>
          
          {filteredResults.length === 0 && !searching ? (
            <div className="text-center py-12">
              <p className="text-lg text-foreground/60">No users found matching your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredResults.map(u => (
                <div key={u.profile.id} className="bg-card p-6 rounded-3xl shadow-sm border border-border hover:shadow-md transition-all duration-300 relative group">
                  {u.profile.avg_rating && (
                    <div className="absolute top-6 right-6 flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      {u.profile.avg_rating}
                    </div>
                  )}
                  <div className="flex gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary/5 text-primary rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                      {u.profile.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight text-foreground">
                        {u.profile.full_name || "SkillSync Member"}
                      </h3>
                      <p className="text-sm text-foreground/50 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {u.profile.location || "Location hidden"}
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground/60 text-sm mb-4 line-clamp-2">
                    {u.profile.bio || "This user hasn't written a bio yet."}
                  </p>
                  <div className="mb-6">
                    <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">They can teach you:</p>
                    <div className="flex flex-wrap gap-2">
                      {u.skills.map((s: any) => (
                        <span key={s.id} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleConnect(u.profile.id)}
                    disabled={connecting === u.profile.id || sentRequests.has(u.profile.id)}
                    className={`w-full py-3 rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all shadow-sm flex justify-center items-center gap-2 ${sentRequests.has(u.profile.id) ? 'bg-green-50 text-green-600 border border-green-100 cursor-default hover:translate-y-0' : 'bg-foreground text-background disabled:opacity-50'}`}
                  >
                    {connecting === u.profile.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : sentRequests.has(u.profile.id) ? (
                      'Request Sent'
                    ) : (
                      'Request Connection'
                    )}
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
