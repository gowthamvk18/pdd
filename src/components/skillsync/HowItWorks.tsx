

const STEPS = [
  {
    number: "1",
    title: "List your skill",
    description: "Tell us what you're good at, whether it's Python, poetry, or planting tomatoes. It only takes a minute."
  },
  {
    number: "2",
    title: "Find a match",
    description: "Search for what you want to learn. Our platform connects you with someone looking for exactly what you offer."
  },
  {
    number: "3",
    title: "Swap an hour",
    description: "Meet over video. Spend 30 minutes teaching, and 30 minutes learning. Zero invoices."
  }
]

export const HowItWorks = () => {
  return (
    <section id="how" className="py-24 px-6">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16">
          How the exchange works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {STEPS.map((step, idx) => (
            <div key={idx} className="text-center p-8">
              <div className="w-12 h-12 bg-card text-clay rounded-full flex items-center justify-center font-display text-2xl font-bold mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-foreground/70 text-lg leading-relaxed">
                {step.description.includes("Zero invoices.") ? (
                  <>
                    {step.description.replace("Zero invoices.", "")}
                    <span className="clay-italic">Zero invoices.</span>
                  </>
                ) : (
                  step.description
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
