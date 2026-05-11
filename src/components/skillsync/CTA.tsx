import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface CTAProps {
  onOpenAuth?: () => void;
}

export const CTA = ({ onOpenAuth }: CTAProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else if (onOpenAuth) {
      onOpenAuth();
    }
  };

  return (
    <section id="cta" className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-foreground text-background rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          {/* Radial dot pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "24px 24px"
          }}></div>
          
          {/* Blurred Orbs */}
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-clay rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready to share what you know?</h2>
            <p className="text-xl text-background/80 mb-10">Join 12,000+ people building a new economy based on knowledge, not capital.</p>
            <button 
              onClick={handleCTA}
              className="inline-block bg-background text-foreground font-display font-bold px-8 py-4 rounded-full text-lg hover:bg-card hover:-translate-y-1 hover:shadow-soft transition-all duration-300"
            >
              {user ? 'Go to Dashboard' : 'Create your profile'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
