import { Home, Search, MessageCircle, User, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Sparkles, label: 'AI Coach', path: '/coach' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border px-6 py-3 flex justify-between items-center z-50 pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary scale-110' : 'text-foreground/40 hover:text-foreground/60'}`}
          >
            <item.icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
