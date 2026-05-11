
import { Quote } from 'lucide-react'

const STORIES = [
  {
    quote: "I traded my knowledge of React for someone to teach me basic Japanese. We meet every Tuesday. Best decision ever.",
    author: "Elena P.",
    exchange: "React ⇄ Japanese",
    color: "var(--color-clay)",
    bg: "linear-gradient(180deg, var(--color-background), var(--color-card))"
  },
  {
    quote: "As a freelance illustrator, I couldn't afford accounting advice. I traded two hours of logo design for bookkeeping help.",
    author: "Sarah M.",
    exchange: "Illustration ⇄ Accounting",
    color: "var(--color-clay)",
    bg: "linear-gradient(180deg, var(--color-background), var(--color-card))"
  },
  {
    quote: "I've learned more conversational Italian in three weeks of swapping guitar lessons than I did in three years of apps.",
    author: "Marcus T.",
    exchange: "Guitar ⇄ Italian",
    color: "var(--color-clay)",
    bg: "linear-gradient(180deg, var(--color-background), var(--color-card))"
  }
]

export const Stories = () => {
  return (
    <section id="stories" className="py-24 px-6 overflow-hidden">
      <div className="container mx-auto">
        <h2 className="text-4xl font-display font-bold text-center mb-16">Stories from the network</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {STORIES.map((story, idx) => (
            <div 
              key={idx} 
              className="p-8 rounded-2xl border border-[#8b7355]/15 transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated hover:-rotate-1 relative"
              style={{ background: story.bg }}
            >
              <Quote className="w-8 h-8 text-clay/40 mb-6" />
              <p className="text-lg leading-relaxed mb-8 italic text-foreground/80">"{story.quote}"</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full" style={{ background: story.color }}></div>
                <div>
                  <h4 className="font-bold text-foreground">{story.author}</h4>
                  <p className="text-sm text-foreground/60">{story.exchange}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
