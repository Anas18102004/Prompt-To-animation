import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Play, Copy, Download, Sparkles } from "lucide-react";

const codeExamples = {
  manim: `from manim import *

class DNAHelix(Scene):
    def construct(self):
        # Create DNA double helix
        helix1 = ParametricFunction(
            lambda t: np.array([
                np.cos(t),
                np.sin(t),
                t * 0.3
            ]),
            t_range=[-4*PI, 4*PI],
            color=BLUE
        )
        
        helix2 = ParametricFunction(
            lambda t: np.array([
                np.cos(t + PI),
                np.sin(t + PI), 
                t * 0.3
            ]),
            t_range=[-4*PI, 4*PI],
            color=RED
        )
        
        # Add glowing particles
        particles = VGroup(*[
            Dot(radius=0.05, color=YELLOW).add_updater(
                lambda mob, dt: mob.shift(
                    0.1 * np.random.randn(3)
                )
            )
            for _ in range(50)
        ])
        
        # Animate
        self.play(Create(helix1), Create(helix2))
        self.add(particles)
        self.play(Rotate(helix1, 2*PI), Rotate(helix2, 2*PI))`,
        
  threejs: `import * as THREE from 'three';

// Create DNA Helix Animation
class DNAHelix {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        
        this.createHelix();
        this.addParticles();
        this.animate();
    }
    
    createHelix() {
        const points1 = [];
        const points2 = [];
        
        for (let i = 0; i <= 200; i++) {
            const t = (i / 200) * Math.PI * 8;
            
            points1.push(new THREE.Vector3(
                Math.cos(t) * 2,
                Math.sin(t) * 2,
                t * 0.5 - 10
            ));
            
            points2.push(new THREE.Vector3(
                Math.cos(t + Math.PI) * 2,
                Math.sin(t + Math.PI) * 2,
                t * 0.5 - 10
            ));
        }
        
        const geometry1 = new THREE.BufferGeometry().setFromPoints(points1);
        const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
        
        const material1 = new THREE.LineBasicMaterial({ color: 0x00ff88 });
        const material2 = new THREE.LineBasicMaterial({ color: 0xff0088 });
        
        this.helix1 = new THREE.Line(geometry1, material1);
        this.helix2 = new THREE.Line(geometry2, material2);
        
        this.scene.add(this.helix1, this.helix2);
    }`,
    
  blender: `import bpy
import bmesh
import mathutils
import math

# Clear existing mesh objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def create_dna_helix():
    # Create helix curves
    curve_data1 = bpy.data.curves.new('helix1', type='CURVE')
    curve_data1.dimensions = '3D'
    curve_data1.resolution_u = 64
    
    # Create spline
    polyline1 = curve_data1.splines.new('NURBS')
    polyline1.points.add(199)
    
    # Generate helix points
    for i in range(200):
        t = (i / 200) * math.pi * 8
        x = math.cos(t) * 2
        y = math.sin(t) * 2
        z = t * 0.5 - 10
        polyline1.points[i].co = (x, y, z, 1)
    
    # Create curve object
    helix_obj1 = bpy.data.objects.new('helix1', curve_data1)
    bpy.context.collection.objects.link(helix_obj1)
    
    # Add materials with emission
    mat1 = bpy.data.materials.new(name="HelixMaterial1")
    mat1.use_nodes = True
    emission = mat1.node_tree.nodes.new(type='ShaderNodeEmission')
    emission.inputs[0].default_value = (0, 1, 0.5, 1)  # Cyan glow
    emission.inputs[1].default_value = 2.0  # Strength
    
    output = mat1.node_tree.nodes.get('Material Output')
    mat1.node_tree.links.new(emission.outputs[0], output.inputs[0])`
};

export const CodePreviewSection = () => {
  const [activeTab, setActiveTab] = useState("manim");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCode = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6">
            <span className="gradient-text">Code + Preview</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch as AI transforms your ideas into production-ready animation code
            across multiple frameworks, with instant visual feedback.
          </p>
        </div>

        {/* Input section */}
        <div className="mb-12">
          <Card className="glass-card bg-glass/20 backdrop-blur-xl border border-glass-border max-w-4xl mx-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-medium">AI Prompt</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              
              <div className="relative">
                <textarea 
                  className="w-full bg-input/30 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-20"
                  placeholder="Create a spinning DNA double helix with glowing particles floating around it..."
                  defaultValue="Create a spinning DNA double helix with glowing particles floating around it..."
                />
                <Button 
                  onClick={generateCode}
                  disabled={isGenerating}
                  className="absolute bottom-3 right-3 bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
                >
                  {isGenerating ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Code + Preview split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Code panel */}
          <Card className="glass-card bg-glass/20 backdrop-blur-xl border border-glass-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-secondary" />
                  <span className="font-medium">Generated Code</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-glass-border hover:bg-glass/30">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-glass-border hover:bg-glass/30">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-glass/30 border border-glass-border">
                  <TabsTrigger value="manim" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Manim
                  </TabsTrigger>
                  <TabsTrigger value="threejs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Three.js
                  </TabsTrigger>
                  <TabsTrigger value="blender" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Blender
                  </TabsTrigger>
                </TabsList>

                {Object.entries(codeExamples).map(([key, code]) => (
                  <TabsContent key={key} value={key} className="mt-4">
                    <div className="bg-black/50 rounded-xl p-4 border border-glass-border">
                      <pre className="text-sm text-foreground overflow-x-auto">
                        <code className="language-python">{code}</code>
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </Card>

          {/* Preview panel */}
          <Card className="glass-card bg-glass/20 backdrop-blur-xl border border-glass-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-accent" />
                  <span className="font-medium">Live Preview</span>
                </div>
                <Button variant="outline" size="sm" className="border-glass-border hover:bg-glass/30">
                  <Play className="h-4 w-4 mr-2" />
                  Render
                </Button>
              </div>

              <div className="aspect-square bg-black/60 rounded-xl border border-glass-border flex items-center justify-center relative overflow-hidden">
                {/* Animated preview placeholder */}
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-primary rounded-full animate-spin opacity-60"></div>
                  <div className="absolute inset-0 w-32 h-32 border-4 border-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                  <div className="absolute inset-4 w-24 h-24 border-2 border-accent rounded-full animate-pulse"></div>
                  
                  {/* Floating particles */}
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    ></div>
                  ))}
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    DNA Helix Animation Preview
                  </p>
                  <div className="flex justify-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-300"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-700"></div>
                  </div>
                </div>
              </div>

              {/* Export options */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quality:</span>
                  <span className="text-primary font-medium">4K Ultra HD</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="text-secondary font-medium">MP4, GIF, WebM</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Render Time:</span>
                  <span className="text-accent font-medium">~3.2 seconds</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Feature callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { title: "Syntax Highlighting", desc: "Beautiful code with intelligent highlighting", color: "primary" },
            { title: "Error Detection", desc: "Real-time error checking and suggestions", color: "secondary" },
            { title: "Auto-Optimization", desc: "Performance optimizations applied automatically", color: "accent" }
          ].map((feature, index) => (
            <div key={index} className="glass-card bg-glass/10 backdrop-blur-xl border border-glass-border p-4 text-center">
              <div className={`w-8 h-8 bg-${feature.color} rounded-lg mx-auto mb-3 opacity-80`}></div>
              <h4 className="font-semibold mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
