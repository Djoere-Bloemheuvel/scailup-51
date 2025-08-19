
import { memo } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Mark van der Berg",
    company: "TechStart B.V.",
    role: "CEO",
    quote: "ScailUp heeft ons van 2 naar 47 afspraken per maand gebracht. Hun team regelt alles - van strategie tot uitvoering. Ik kan me nu focussen op wat ik het beste doe: deals sluiten.",
    avatar: "MB",
    result: "47 afspraken/maand"
  },
  {
    name: "Lisa Janssen", 
    company: "InnovateCorp",
    role: "Sales Director",
    quote: "Eindelijk een partner die outbound écht begrijpt. Geen tools die we zelf moesten uitzoeken, maar een volledig team dat resultaten levert. €890K pipeline in 2 maanden.",
    avatar: "LJ",
    result: "€890K pipeline"
  },
  {
    name: "Rick Verhoeven",
    company: "Scale Solutions",
    role: "Founder", 
    quote: "De AI-personalisatie van ScailUp is next level. Onze response rates zijn 340% gestegen en we hebben nu een voorspelbare leadflow. Absoluut een gamechanger.",
    avatar: "RV",
    result: "340% meer response"
  }
];

export const TestimonialsSection = memo(() => {
  return (
    <section id="testimonials" className="py-32 bg-gradient-to-b from-[#0A0A0A] to-[#111111] relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Wat Onze Klanten Zeggen
          </h2>
          <p className="text-xl text-[#CCCCCC] max-w-3xl mx-auto">
            Ontdek waarom 200+ B2B bedrijven ScailUp vertrouwen voor hun outbound marketing.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="group bg-[#111111] border border-[#222222] rounded-3xl p-8 hover:border-[#2196F3]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#2196F3]/10 hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="h-8 w-8 text-[#2196F3] opacity-50" />
              </div>

              {/* Testimonial Text */}
              <p className="text-[#CCCCCC] leading-relaxed mb-8 italic">
                "{testimonial.quote}"
              </p>

              {/* Client Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{testimonial.name}</h4>
                    <p className="text-[#CCCCCC] text-xs">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
                
                {/* Result Badge */}
                <div className="text-right">
                  <div className="bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent font-bold text-xs">
                    {testimonial.result}
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex gap-1 mt-6 pt-6 border-t border-[#222222]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#2196F3] text-[#2196F3]" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Element */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-[#111111]/50 backdrop-blur-sm rounded-2xl px-8 py-4 border border-[#222222]">
            <div className="flex -space-x-2">
              {testimonials.map((_, index) => (
                <div key={index} className="w-8 h-8 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-full border-2 border-[#111111]"></div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">200+ tevreden klanten</p>
              <p className="text-[#CCCCCC] text-xs">Gemiddeld 4.9/5 sterren</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';
