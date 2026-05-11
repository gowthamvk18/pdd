import { useNavigate } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { SEO } from '../components/SEO';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-6 text-center">
      <SEO title="404 - Page Not Found | SkillSync" />
      
      <div className="relative mb-8">
        <div className="text-[150px] font-display font-black text-primary/10 leading-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center rotate-12">
            <Compass className="w-16 h-16 text-primary animate-bounce" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-display font-bold mb-4 text-foreground">Lost in the Skillverse?</h1>
      <p className="text-foreground/60 max-w-md mb-12 text-lg">
        The page you are looking for doesn't exist or has been moved to a new dimension.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button 
          onClick={() => navigate('/')}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
        >
          <Home className="w-5 h-5" /> Back Home
        </button>
        <button 
          onClick={() => navigate('/explore')}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white border border-black/5 text-foreground rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
        >
          <Compass className="w-5 h-5" /> Explore Skills
        </button>
      </div>
    </div>
  );
};
