import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaDescription } from '@/hooks/useMetaDescription';
import { Card, CardContent } from '@/components/ui/card';
import { Network, ArrowLeft, Home, Beaker } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui';

export default function NotFound() {
  usePageTitle('404 Not Found');
  useMetaDescription('404 - The page you are looking for does not exist in PathForge Academy.');

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(circle at 50% 50%, #22d3ee 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} 
      />
      
      <div className="z-10 w-full max-w-lg mx-4">
        <div className="flex justify-center mb-8">
          <div className="relative">
             <Network className="h-24 w-24 text-red-500/80 animate-pulse" />
             <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
          </div>
        </div>

        <Card className="border-red-500/20 bg-black/40 backdrop-blur-md shadow-2xl shadow-red-500/5">
          <CardContent className="pt-10 pb-10 text-center flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold font-mono tracking-tighter text-white mb-2">
              404
            </h1>
            <h2 className="text-xl font-mono text-red-400 mb-4 tracking-widest uppercase">
              Path Not Found
            </h2>
            <div className="h-px w-16 bg-red-500/50 mb-6" />
            <p className="text-sm font-mono text-muted-foreground mb-10 max-w-[280px] leading-relaxed">
              The algorithm attempted to traverse this route, but hit a dead end. No valid nodes exist at this destination.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto font-mono text-xs tracking-widest gap-2 border-border/50 hover:bg-white/5">
                  <Home className="w-4 h-4" /> HOME
                </Button>
              </Link>
              <Link href="/lab">
                <Button className="w-full sm:w-auto font-mono text-xs tracking-widest gap-2 bg-primary/90 hover:bg-primary text-black">
                  <Beaker className="w-4 h-4" /> TO THE LAB
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
