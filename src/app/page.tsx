'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Film,
  Shuffle,
  FileText,
  ChartPie,
  Tags,
  ShieldCheck,
  Cpu,
  WifiOff,
  FilePlus2,
  ListTree,
  BookUser,
  Twitter,
  Github,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CinematicBackground } from '@/components/cinematic-background';
import Image from 'next/image';
import cineMonLogo from '@/app/assets/logo/cine-mon-logo.png';
import avatar4 from '@/app/assets/avatars/avatar-4.png';
import avatar6 from '@/app/assets/avatars/avatar-6.png';
import avatar8 from '@/app/assets/avatars/avatar-8.png';

// Intersection Observer Hook for animations
const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const [ref, setRef] = React.useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (ref) {
          observer.unobserve(ref);
        }
      }
    }, options);

    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, options]);

  return [setRef, isVisible] as const;
};

const AnimatedSection = ({ children, className, ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div ref={ref} className={cn('fade-in-section', isVisible && 'is-visible', className)} {...props}>
      {children}
    </div>
  );
};

export default function LandingPage() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
    
  const features = [
    { icon: Film, title: 'Personal Watchlist & History', description: 'Catalog every movie and show you’ve ever seen.' },
    { icon: Shuffle, title: 'Spin the Wheel', description: 'Let fate pick your next watch from your collection.' },
    { icon: FileText, title: 'Script Upload & Archiving', description: 'Keep your favorite scripts just a click away.' },
    { icon: ChartPie, title: 'Watch Analytics & Insights', description: 'Visualize your habits and discover your unique taste.' },
    { icon: Tags, title: 'Custom Posters & Tags', description: 'Personalize your library with custom art and smart tags.' },
    { icon: ShieldCheck, title: 'Offline-First, Fully Private', description: 'Your data stays on your device. No clouds, no accounts.' },
  ];

  const specialFeatures = [
    { icon: Cpu, title: 'Smart UI', description: 'An intuitive interface designed for speed and clarity.' },
    { icon: WifiOff, title: 'Full Offline Access', description: 'Your entire collection is available, with or without internet.' },
    { icon: FilePlus2, title: 'Custom Scripts', description: 'Add your own notes, analysis, or alternative endings.' },
    { icon: ListTree, title: 'Advanced Genre Sorting', description: 'Filter and sort with a powerful, flexible tagging system.' },
    { icon: BookUser, title: 'Script Collector Mode', description: 'A dedicated view for writers and film students to study scripts.' },
  ];

  const testimonials = [
    {
      name: 'Aki K.',
      handle: '@akikurosawa',
      avatar: avatar4.src,
      imageHint: 'person portrait',
      quote: 'Cine-Mon is the Notion for movie lovers I never knew I needed. The offline access is a game-changer for my subway commute.',
    },
    {
      name: 'Jordan P.',
      handle: '@reelcritic',
      avatar: avatar6.src,
      imageHint: 'person portrait',
      quote: 'Finally, an app that respects my obsession. The script archiving feature is incredible for my analysis work. A must-have for any serious cinephile.',
    },
    {
      name: 'Sofia C.',
      handle: '@filmsofia',
      avatar: avatar8.src,
      imageHint: 'person portrait',
      quote: 'It’s beautiful, it’s fast, and the "Surprise Me" wheel has solved so many "what to watch" debates in my house. 10/10!',
    },
  ];

  return (
    <div className="bg-black text-gray-100 font-body antialiased overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src={cineMonLogo} alt="Cine-Mon Logo" width={32} height={32} data-ai-hint="logo" />
            <span className="text-xl font-bold font-headline">Cine-Mon</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">Testimonials</a>
            <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">About</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">GitHub</a>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/dashboard" target="_blank" rel="noopener noreferrer">
                <Button>
                    Go to App <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section 
            onMouseMove={handleMouseMove}
            className="hero-section-container relative min-h-screen flex items-center justify-center text-center"
        >
          <div
            className="dotted-backdrop"
            style={{
                '--mouse-x': `${mousePosition.x}px`,
                '--mouse-y': `${mousePosition.y}px`,
            } as React.CSSProperties}
          />
          <CinematicBackground />
          <div className="relative z-10 container mx-auto px-6">
            <h1 className="text-4xl md:text-7xl font-bold font-headline text-white text-glow leading-tight">
              Archive Your Cinematic Life
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Track what you’ve watched. Curate what you love. Rediscover what matters.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
               <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto shadow-neon hover:shadow-neon-hover transition-shadow duration-300">
                    Install Web App
                  </Button>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Github className="mr-2" /> Open on GitHub
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Key Features Grid */}
        <AnimatedSection id="features" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
               <h2 className="text-3xl md:text-5xl font-bold font-headline text-white text-glow">
                Everything a Cinephile Needs
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                    <p className="mt-1 text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Live Previews */}
        <AnimatedSection className="py-20">
          <div className="container mx-auto px-6 text-center">
             <h2 className="text-3xl md:text-5xl font-bold font-headline text-white text-glow">
              Your Cinema, Your Way
            </h2>
             <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              A stunning interface on both desktop and mobile.
            </p>
            <div className="mt-12 relative flex items-center justify-center gap-4 lg:gap-8">
                <img
                    src="https://placehold.co/800x600.png"
                    alt="Cine-Mon on Desktop"
                    width={800}
                    height={600}
                    className="rounded-lg shadow-2xl shadow-primary/20 border-2 border-primary/20 transform lg:scale-110 lg:-rotate-3 transition hover:rotate-0 hover:scale-115"
                    data-ai-hint="app screenshot desktop"
                />
                 <img
                    src="https://placehold.co/300x600.png"
                    alt="Cine-Mon on Mobile"
                    width={300}
                    height={600}
                    className="hidden lg:block rounded-lg shadow-2xl shadow-primary/20 border-2 border-primary/20 transform rotate-3 transition hover:rotate-0 hover:scale-105 z-10"
                    data-ai-hint="app screenshot mobile"
                />
            </div>
          </div>
        </AnimatedSection>

        {/* What Makes Cine-Mon Special */}
        <AnimatedSection className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-bold font-headline text-white text-glow">
                More than a watchlist—it’s your personal cinema journal
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {specialFeatures.map((feature, index) => (
                <Card key={index} className="bg-gray-900/50 border-primary/20 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </AnimatedSection>
        
        {/* Testimonials */}
        <AnimatedSection id="testimonials" className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline text-white text-glow">From One Cinephile to Another</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.handle} className="bg-gray-900/50 border-gray-800 flex flex-col justify-between">
                            <CardContent className="pt-6">
                                <p className="text-gray-300">"{testimonial.quote}"</p>
                            </CardContent>
                            <CardHeader className="flex-row items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.imageHint} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.handle}</p>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </AnimatedSection>


        {/* Final CTA */}
        <AnimatedSection className="py-20 text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold font-headline text-white text-glow">
              Ready to Curate Your Collection?
            </h2>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto shadow-neon hover:shadow-neon-hover transition-shadow duration-300">
                    Install Web App
                  </Button>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Github className="mr-2" /> Host Your Own Copy
                </Button>
              </a>
            </div>
             <div className="mt-8">
                <a href="https://twitter.com/intent/tweet?text=Just%20started%20using%20Cine-Mon%20to%20archive%20my%20cinematic%20life!%20%23cinephile%20%23movietracker" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <Twitter className="w-5 h-5" />
                    <span>Share on X</span>
                </a>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
                <Image src={cineMonLogo} alt="Cine-Mon Logo" width={24} height={24} data-ai-hint="logo" />
                <span className="text-lg font-bold">Cine-Mon</span>
            </div>
            <div className="flex gap-6 text-gray-400">
              <Link href="/legal" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/legal" className="hover:text-primary transition-colors">Privacy</Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
              <a href="mailto:geoffreymagana21@gmail.com" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
           <div className="text-center text-gray-500 text-sm mt-8">
            &copy; {new Date().getFullYear()} Cine-Mon. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
