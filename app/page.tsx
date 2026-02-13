import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureCards } from "@/components/landing/feature-cards";
import { ArrowRight, BookOpen } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-72 rounded-full bg-zen-teal/20 blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl animate-float-slower" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-32">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-border px-4 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Built on Horizen L3
              </span>
            </div>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Open-data crates for macro exposure and strategy signals
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Non-custodial synthetic proxy indices and rules-based strategy
              vaults. No custody, no redemption promises - just transparent
              on-chain exposure powered by open data.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-zen-teal text-background hover:bg-zen-teal/90 font-medium"
              >
                <Link href="/crates">
                  Explore Crates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground"
                disabled
              >
                Build a Crate (Soon)
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                disabled
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Docs
              </Button>
            </div>
          </div>
        </div>
        <div className="h-px bg-border" />
      </section>

      {/* Feature Cards */}
      <section className="bg-zen-navy-light">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three pillars of the ZenCrates protocol.
            </p>
          </div>
          <FeatureCards />
        </div>
      </section>

      {/* Safety Disclaimer */}
      <section className="bg-zen-purple">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              ZenCrates provides software for on-chain exposure. It is not
              financial advice. Synthetic tokens do not represent ownership
              of underlying assets. Smart contract risk, oracle risk, and
              market risk apply. Use at your own discretion.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
