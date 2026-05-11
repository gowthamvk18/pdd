import { useAuth } from '../../contexts/AuthContext'
import { LogOut, User, Sun, Moon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../contexts/ThemeContext'

interface NavbarProps {
  onOpenAuth?: () => void;
}

export const Navbar = ({ onOpenAuth }: NavbarProps) => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex justify-between items-center transition-colors duration-300">
      <a href="/" className="flex items-center gap-3 no-underline text-foreground font-display text-2xl font-extrabold group">
        <img 
          src="/logo.png" 
          alt="SkillSync Handshake Logo" 
          className="w-10 h-10 object-contain rounded-xl animate-hand-shake transform-origin-center" 
        />
        <span>Skill<span className="text-clay">Sync</span></span>
      </a>
      
      <div className="hidden md:flex gap-8 items-center">
        <a href="/explore" className="text-foreground font-medium hover:text-clay transition-colors duration-300">Explore</a>
        <a href="/#how" className="text-foreground font-medium hover:text-clay transition-colors duration-300">How it works</a>
        <a href="/#skills" className="text-foreground font-medium hover:text-clay transition-colors duration-300">Skills</a>
        <a href="/#stories" className="text-foreground font-medium hover:text-clay transition-colors duration-300">Stories</a>
      </div>
      
      <div className="flex gap-4 items-center">
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60 hover:text-foreground"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        {user ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="font-bold bg-foreground text-background px-4 py-2 rounded-full hover:bg-clay hover:-translate-y-0.5 transition-all shadow-sm"
            >
              Dashboard
            </button>
            <div className="hidden md:flex items-center gap-2 bg-muted px-4 py-2 rounded-full border border-border">
              <User className="w-4 h-4" />
              <span className="text-sm font-bold truncate max-w-[150px]">{user.email}</span>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60 hover:text-foreground"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <button onClick={onOpenAuth} className="font-semibold px-4 py-2 hover:text-clay transition-colors duration-300">Sign in</button>
            <button onClick={onOpenAuth} className="bg-foreground text-background font-semibold px-6 py-2 rounded-full hover:bg-clay hover:-translate-y-0.5 shadow-soft transition-all duration-300">
              Join free
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
