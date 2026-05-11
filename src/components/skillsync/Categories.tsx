
import { Terminal, PenTool, Music, Globe, Camera, ChefHat, Activity, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const CATEGORIES = [
  { title: "Tech & Code", count: "3,204 swappers", icon: Terminal, slug: "Tech" },
  { title: "Design & Art", count: "2,841 swappers", icon: PenTool, slug: "Design" },
  { title: "Music & Audio", count: "1,102 swappers", icon: Music, slug: "Music" },
  { title: "Languages", count: "4,590 swappers", icon: Globe, slug: "Languages" },
  { title: "Photo & Film", count: "945 swappers", icon: Camera, slug: "Photography" },
  { title: "Cooking", count: "1,320 swappers", icon: ChefHat, slug: "Cooking" },
  { title: "Fitness & Health", count: "876 swappers", icon: Activity, slug: "Fitness" },
  { title: "Writing", count: "1,650 swappers", icon: BookOpen, slug: "Writing" },
]

interface CategoriesProps {
  onOpenAuth?: () => void;
}

export const Categories = ({ onOpenAuth }: CategoriesProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCategoryClick = (slug: string) => {
    if (user) {
      navigate(`/explore?category=${slug}`);
    } else if (onOpenAuth) {
      onOpenAuth();
    }
  };

  return (
    <section id="skills" className="py-24 px-6 bg-card">
      <div className="container mx-auto">
        <h2 className="text-4xl font-display font-bold text-center mb-4">Explore by category</h2>
        <p className="text-center text-clay mb-16 text-lg">Find exactly what you want to learn.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {CATEGORIES.map((cat, idx) => (
            <button 
              key={idx} 
              onClick={() => handleCategoryClick(cat.slug)}
              className="group relative bg-background border border-[#8b7355]/15 p-8 rounded-2xl text-foreground text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-soft hover:border-transparent overflow-hidden cursor-pointer"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-clay opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col gap-4">
                <cat.icon className="w-6 h-6 text-foreground group-hover:text-clay group-hover:scale-110 transition-all duration-300" />
                <div>
                  <div className="font-display font-semibold text-xl mb-1">{cat.title}</div>
                  <div className="text-sm text-foreground/70">{cat.count}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
