import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { X, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'signin' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, initialView = 'signin' }: AuthModalProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'signin' | 'signup'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Sync internal view state with initialView prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      if (view === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (signUpError) throw signUpError;
        
        if (data.session) {
          onClose();
          navigate('/dashboard');
        } else {
          setMessage('Check your email for the login link!');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (signInError) throw signInError;
        onClose();
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.message === 'Failed to fetch') {
        setError('Network error: Could not connect to Supabase. Please check your internet connection.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again or sign up if you don\'t have an account.');
      } else if (err.message.includes('Email address is invalid')) {
        setError('The email address provided is not valid. Please check for typos.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-foreground/50 hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-display font-bold mb-2">
          {view === 'signin' ? 'Welcome back' : 'Join SkillSync'}
        </h2>
        <p className="text-foreground/60 mb-8">
          {view === 'signin' 
            ? 'Enter your details to access your account.' 
            : 'Create an account to start trading skills.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-foreground/80 ml-1">Email</label>
            <div className="flex items-center mt-1 p-4 bg-muted rounded-xl border border-border focus-within:border-primary transition-colors">
              <Mail className="w-5 h-5 text-foreground/40 mr-3" />
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="bg-transparent outline-none flex-1 text-foreground"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-foreground/80 ml-1">Password</label>
            <div className="flex items-center mt-1 p-4 bg-muted rounded-xl border border-border focus-within:border-primary transition-colors">
              <Lock className="w-5 h-5 text-foreground/40 mr-3" />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="bg-transparent outline-none flex-1 text-foreground"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm font-medium mt-2 p-3 bg-red-500/10 rounded-lg">{error}</div>}
          {message && <div className="text-green-500 text-sm font-medium mt-2 p-3 bg-green-500/10 rounded-lg">{message}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-foreground text-background rounded-xl font-bold text-lg mt-6 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Processing...' : (view === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-foreground/60">
          {view === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
            className="text-primary hover:underline font-bold"
          >
            {view === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
