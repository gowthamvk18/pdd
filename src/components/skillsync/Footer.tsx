import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface FooterProps {
  onOpenAuth?: () => void;
}

export const Footer = ({ onOpenAuth }: FooterProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleExploreClick = () => {
    if (user) {
      navigate('/explore');
    } else if (onOpenAuth) {
      onOpenAuth();
    }
  };

  return (
    <footer className="bg-card py-16 px-6 border-t border-border transition-colors duration-300">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 text-foreground font-display text-2xl font-extrabold group mb-4">
              <img 
                src="/logo.png" 
                alt="SkillSync Handshake Logo" 
                className="w-10 h-10 object-contain rounded-xl animate-hand-shake transform-origin-center" 
              />
              <span>Skill<span className="text-clay">Sync</span></span>
            </button>
            <p className="text-foreground/70 max-w-xs">The peer-to-platform where knowledge is the only currency.</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><button onClick={handleExploreClick} className="text-foreground/70 hover:text-clay transition-colors text-left">Explore Skills</button></li>
              <li><a href="/#how" className="text-foreground/70 hover:text-clay transition-colors">How it Works</a></li>
              <li><a href="/#stories" className="text-foreground/70 hover:text-clay transition-colors">Success Stories</a></li>
              <li><button onClick={() => alert('Safety guidelines coming soon!')} className="text-foreground/70 hover:text-clay transition-colors text-left">Safety Guidelines</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><button onClick={() => alert('About SkillSync coming soon!')} className="text-foreground/70 hover:text-clay transition-colors text-left">About Us</button></li>
              <li><button onClick={() => alert('Our Manifesto coming soon!')} className="text-foreground/70 hover:text-clay transition-colors text-left">Manifesto</button></li>
              <li><button onClick={() => alert('Careers coming soon!')} className="text-foreground/70 hover:text-clay transition-colors text-left">Open Roles</button></li>
              <li><button onClick={() => alert('Contact us at support@skillsync.app')} className="text-foreground/70 hover:text-clay transition-colors text-left">Contact</button></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#8b7355]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/50">
          <p>&copy; 2026 SkillSync. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-clay animate-pulse-ring"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
