import { Sparkles, ArrowRight } from 'lucide-react'
import { Hero3D } from './Hero3D'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface HeroProps {
  onOpenAuth: () => void;
}

export const Hero = ({ onOpenAuth }: HeroProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      onOpenAuth();
    }
  };

  return (
    <section className="container mx-auto px-6 py-8 min-h-[calc(100vh-80px)] flex flex-col lg:flex-row items-stretch gap-8">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col justify-center py-12 animate-fade-up">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-[#8b7355]/20 rounded-full text-sm font-semibold text-clay mb-8 w-fit">
          <Sparkles className="w-4 h-4 text-accent" />
          Trade skills, not money
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
          Teach what you <span className="highlight-underline">know</span>.<br/>
          Learn what you <span className="clay-italic">love.</span>
        </h1>
        
        <p className="text-xl text-foreground/70 mb-10 max-w-xl leading-relaxed">
          Swap an hour of your expertise for an hour of someone else’s. 
          No money, no subscriptions. Just pure human connection and knowledge.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button 
            onClick={handleCTA}
            className="group inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-semibold rounded-full hover:bg-clay hover:-translate-y-0.5 shadow-soft transition-all duration-300"
          >
            {user ? 'Go to Dashboard' : 'Start your first swap'}
            <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <a href="/#how" className="btn-outline inline-flex items-center justify-center px-6 py-3 border border-clay text-clay font-semibold rounded-full hover:bg-[#8b7355]/5 transition-all duration-300">
            See how it works
          </a>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-foreground/70">
          <div className="flex">
            <div className="w-8 h-8 rounded-full border-2 border-background ml-0 bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]"></div>
            <div className="w-8 h-8 rounded-full border-2 border-background -ml-2.5 bg-gradient-to-br from-[#f6d365] to-[#fda085]"></div>
            <div className="w-8 h-8 rounded-full border-2 border-background -ml-2.5 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]"></div>
            <div className="w-8 h-8 rounded-full border-2 border-background -ml-2.5 bg-gradient-to-t from-[#cfd9df] to-[#e2ebf0]"></div>
          </div>
          <span><strong>12,000+</strong> exchanges across 84 countries</span>
        </div>
        
      </div>
      
      {/* Right Panel (3D) */}
      <div className="flex-1 relative overflow-hidden min-h-[400px]">
        <Hero3D />
      </div>
    </section>
  )
}
