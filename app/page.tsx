import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";

import Link from "next/link";
import { Brain, BarChart3, Zap } from "lucide-react";

export default function Home() {
  return (
  <div className="min-h-screen">
    <Navbar />

    {/* hero section */}
    <section className="relative">
      {/* gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-20">
            <div className="w-[800px] h-[800px] rounded-full bg-stride-blue" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-32 sm:py-48">
        <div className="text-center space-y-8">
          {/* headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            AI-powered clarity
            <br />
            <span className="text-stride-blue">for your projects</span>
          </h1>

          {/* subheadline */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Stride combines smart task tracking with an AI advisor 
            that helps you prioritize, unblock, and ship faster.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
             <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* features section */}
    <section className="max-w-7xl mx-auto px-4 py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <FeatureCard
          icon={Brain}
          title="AI Project Insights"
          description="Get smart recommendations on what to tackle next, identify blockers, and optimize your workflow with intelligent analysis."
        />

        <FeatureCard
          icon={BarChart3}
          title="Smart Task Tracking"
          description="Visual boards, status tracking, and real-time updates keep your team aligned and moving forward together."
        />

        <FeatureCard
          icon={Zap}
          title="Real-time Collaboration"
          description="See changes instantly as your team works. No refresh needed, no confusion, just seamless flow."
        />
      </div>
    </section>

    {/* footer */}
    <footer className="border-t border-zinc-800 mt-32">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-stride-blue">Stride</span>
            <span className="text-zinc-500 text-sm">© 2025</span>
          </div>

          <div className="flex gap-8 text-sm text-zinc-400">
            <Link href="/privacy" className="hover:text-zinc-100 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-100 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-zinc-100 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  </div>
  )
}
