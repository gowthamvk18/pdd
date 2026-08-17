import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { X, Mail, Lock, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'signin' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, initialView = 'signin' }: AuthModalProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'signin' | 'signup'>(initialView);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    try {
      if (view === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp(
          authMethod === 'email' 
            ? { email: cleanEmail, password: cleanPassword }
            : { phone: cleanPhone, password: cleanPassword }
        );
        if (signUpError) throw signUpError;
        
        if (data.session) {
          onClose();
          navigate('/dashboard');
        } else {
          setMessage(
            authMethod === 'email'
              ? 'Check your email for the login link!'
              : 'Sign up successful! Please check your phone for verification or log in.'
          );
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword(
          authMethod === 'email'
            ? { email: cleanEmail, password: cleanPassword }
            : { phone: cleanPhone, password: cleanPassword }
        );
        if (signInError) throw signInError;
        onClose();
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.message === 'Failed to fetch') {
        setError('Network error: Could not connect to Supabase. Please check your internet connection.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError(`Invalid ${authMethod === 'email' ? 'email' : 'phone number'} or password. Please try again.`);
      } else if (err.message.includes('Email address is invalid')) {
        setError('The email address provided is not valid. Please check for typos.');
      } else if (err.message.includes('Phone number is invalid') || err.message.includes('invalid phone format')) {
        setError('The phone number format is invalid. Please format with country code prefix (e.g. +1234567890).');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-fade-in-up border border-border">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-foreground/50 hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-display font-bold mb-2">
          {view === 'signin' ? 'Welcome back' : 'Join SkillSync'}
        </h2>
        <p className="text-foreground/60 mb-6">
          {view === 'signin' 
            ? 'Enter your details to access your account.' 
            : 'Create an account to start trading skills.'}
        </p>

        {/* Auth Method Toggle */}
        <div className="flex bg-muted p-1 rounded-xl mb-6 border border-border">
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMethod === 'email' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/50 hover:text-foreground'}`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('phone'); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMethod === 'phone' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/50 hover:text-foreground'}`}
          >
            Phone Number
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMethod === 'email' ? (
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
                  required={authMethod === 'email'}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-bold text-foreground/80 ml-1">Phone Number</label>
              <div className="flex items-center mt-1 p-4 bg-muted rounded-xl border border-border focus-within:border-primary transition-colors">
                <Phone className="w-5 h-5 text-foreground/40 mr-3" />
                <input 
                  type="tel" 
                  placeholder="+1234567890" 
                  className="bg-transparent outline-none flex-1 text-foreground"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={authMethod === 'phone'}
                />
              </div>
              <p className="text-[11px] text-foreground/40 mt-1 ml-1">Include country code (e.g. +91 for India, +1 for USA)</p>
            </div>
          )}

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

