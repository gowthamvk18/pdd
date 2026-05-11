

import { Fragment } from 'react'

const SKILLS = [
  "UI Design", "Conversational Spanish", "Watercolor Painting", 
  "React & TypeScript", "Vinyasa Yoga", "Creative Writing", 
  "Sourdough Baking", "3D Modeling"
]

export const SkillMarquee = () => {
  return (
    <section className="w-full overflow-hidden py-16 relative">
      {/* Gradient Masks */}
      <div className="absolute top-0 bottom-0 left-0 w-[15%] bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-[15%] bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex gap-6 w-max animate-scroll-marquee">
        {/* Render multiple sets to ensure seamless infinite scroll */}
        {[...Array(3)].map((_, i) => (
          <Fragment key={i}>
            {SKILLS.map((skill, index) => (
              <div 
                key={`${i}-${index}`}
                className="px-6 py-3 bg-card rounded-full font-medium text-foreground whitespace-nowrap"
              >
                {skill}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </section>
  )
}
