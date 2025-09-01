import { Card } from "@/components/ui/card";
import { MessageSquare, Cpu, Eye, Download } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Enter Text Prompt",
    description: "Describe your animation idea in natural language",
    details: "Our AI understands complex descriptions, physics concepts, and artistic styles.",
    color: "primary"
  },
  {
    icon: Cpu,
    title: "AI Writes Code",
    description: "Advanced neural networks generate optimized animation code",
    details: "Deep learning models trained on millions of animations create perfect code.",
    color: "secondary"
  },
  {
    icon: Eye,
    title: "Preview Instantly",
    description: "See your animation come to life in real-time",
    details: "High-performance rendering engine shows results in milliseconds.",
    color: "accent"
  },
  {
    icon: Download,
    title: "Export & Customize",
    description: "Download code or fine-tune with advanced controls",
    details: "Multiple export formats and granular parameter adjustments available.",
    color: "primary"
  }
];

export const WorkflowSection = () => {
  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From idea to animation in seconds. Our revolutionary AI workflow
            eliminates the complexity of traditional animation programming.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent transform -translate-x-1/2 hidden lg:block"></div>
          
          {/* Glowing dots on timeline */}
          {steps.map((_, index) => (
            <div 
              key={index}
              className="absolute left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 glow-primary hidden lg:block"
              style={{ top: `${index * 25 + 12.5}%` }}
            ></div>
          ))}

          {/* Steps */}
          <div className="space-y-20 lg:space-y-32">
            {steps.map((step, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col gap-8 lg:gap-16`}>
                {/* Step number and icon */}
                <div className="flex-shrink-0 text-center lg:w-1/2">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-card bg-glass/30 backdrop-blur-xl border border-glass-border mb-4 group">
                    <step.icon className={`h-10 w-10 text-${step.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div className={`text-6xl font-orbitron font-bold text-${step.color} opacity-20 mb-2`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Step content */}
                <Card className="glass-card bg-glass/20 backdrop-blur-xl border border-glass-border flex-1 lg:w-1/2 tilt-hover">
                  <div className="p-8">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 gradient-text">
                      {step.title}
                    </h3>
                    <p className="text-lg text-foreground mb-4 font-medium">
                      {step.description}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.details}
                    </p>

                    {/* Progress indicator */}
                    <div className="mt-6 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              i <= index 
                                ? `bg-${step.color} glow-${step.color}` 
                                : 'bg-muted'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">
                        Step {index + 1} of 4
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Demo preview */}
        <div className="mt-20 text-center">
          <div className="glass-card bg-glass/10 backdrop-blur-xl border border-glass-border max-w-4xl mx-auto">
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6 gradient-text">
                See It In Action
              </h3>
              <div className="aspect-video bg-muted/20 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Eye className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Interactive demo coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">Experience the full workflow in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
