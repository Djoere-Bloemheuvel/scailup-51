
import { memo } from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Mark van der Berg",
    company: "TechStart BV",
    quote: "ScailUp heeft ons bedrijf van 10 naar 100+ klanten laten groeien in slechts 6 maanden.",
    avatar: "MB"
  },
  {
    name: "Lisa Janssen", 
    company: "InnovateCorp",
    quote: "De AI-automatisering bespaart ons 20 uur per week. We kunnen nu focussen op échte groei.",
    avatar: "LJ"
  },
  {
    name: "Rick Verhoeven",
    company: "Scale Solutions", 
    quote: "Van 2 naar 50 nieuwe leads per week. ScailUp is onmisbaar voor elke groeiende onderneming.",
    avatar: "RV"
  }
];

export const TestimonialsSection = memo(() => {
  return (
    <section className="container mx-auto px-6 py-16">
      <div className="space-y-12 animate-fade-in [animation-delay:1.4s]">
        <h3 className="text-3xl font-bold text-center text-foreground">
          Succesverhalen van groeiende bedrijven
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card/20 backdrop-blur-sm rounded-xl border border-border/20 p-6 hover-lift">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium">{testimonial.avatar}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
              <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';
