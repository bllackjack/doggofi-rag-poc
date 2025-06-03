'use Client'
import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Users, Award, Zap } from 'lucide-react';
gsap.registerPlugin(ScrollTrigger);
const About: React.FC = () => {
    useEffect(() => {
      gsap.fromTo('.about-content', 
        { opacity: 0, y: 80 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.about-section',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );
  
      gsap.fromTo('.stat-item', 
        { opacity: 0, scale: 0.8 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.6,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: '.stats-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, []);
  
    const stats = [
      { icon: Target, value: '50+', label: 'Projects Completed' },
      { icon: Users, value: '25+', label: 'Happy Clients' },
      { icon: Award, value: '3+', label: 'Years Experience' },
      { icon: Zap, value: '24/7', label: 'Support Available' }
    ];
  
    return (
      <section id="about" className="about-section py-24 bg-gradient-to-b from-dark-bg to-dark-card">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="about-content text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-space mb-6">
                About <span className="text-gradient">HIMITCO</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-neon-cyan to-neon-purple mx-auto mb-8"></div>
            </div>
  
            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              {/* Text Content */}
              <div className="about-content space-y-6">
                <h3 className="text-2xl md:text-3xl font-semibold text-neon-cyan">
                  Pioneering Digital Innovation
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  At HIMITCO, we're not just building websites and apps – we're crafting 
                  digital experiences that define the future. Our team of passionate developers, 
                  designers, and AI specialists work at the intersection of creativity and technology.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  From responsive web applications to intelligent AI platforms, we deliver 
                  solutions that don't just meet today's needs, but anticipate tomorrow's 
                  opportunities. Every project is an opportunity to push boundaries and 
                  redefine what's possible.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                    <span className="text-gray-300">Custom Web Development & Design</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-purple rounded-full"></div>
                    <span className="text-gray-300">Native & Cross-Platform Mobile Apps</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                    <span className="text-gray-300">AI Integration & Machine Learning</span>
                  </div>
                </div>
              </div>
  
              {/* Visual Element */}
              <div className="about-content relative">
                <div className="relative bg-gradient-to-br from-dark-card to-dark-bg p-8 rounded-2xl border border-dark-border">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full opacity-20 blur-xl"></div>
                  <div className="relative z-10">
                    <h4 className="text-xl font-semibold mb-4 text-neon-cyan">Our Mission</h4>
                    <p className="text-gray-300 leading-relaxed">
                      "To empower businesses with cutting-edge technology solutions that drive 
                      growth, enhance user experiences, and create lasting digital impact in 
                      an ever-evolving technological landscape."
                    </p>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Stats Grid */}
            <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="stat-item bg-dark-card border border-dark-border rounded-xl p-6 text-center hover:border-neon-cyan/50 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg mb-4">
                    <stat.icon className="w-6 h-6 text-dark-bg" />
                  </div>
                  <div className="text-2xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default About;
  