import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layers, TrendingUp, Radio, Percent } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Non-Custodial Exposure",
    description:
      "Mint synthetic index tokens that track real-world market prices via oracles. No physical custody, no counterparty holding assets on your behalf.",
  },
  {
    icon: TrendingUp,
    title: "Strategy Crates",
    description:
      "Rules-based DeFi strategy vaults that automatically rebalance across synthetic positions based on macro signals and algorithmic triggers.",
  },
  {
    icon: Radio,
    title: "Transparent Oracle Inputs",
    description:
      "Every price feed, every data source - visible on-chain. Open-data sources from U.S. Treasury and BLS pair with oracle signing for reliable updates.",
  },
  {
    icon: Percent,
    title: "Hold CRATES for Fee Rebates",
    description:
      "Hold the CRATES utility token to unlock tiered fee discounts on protocol operations. Rebates are governance-controlled program parameters - not interest or performance-based distributions.",
    href: "/crates-token",
  },
] as const;

export function FeatureCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((feature) => {
        const Wrapper = "href" in feature && feature.href ? Link : "div";
        const wrapperProps =
          "href" in feature && feature.href
            ? { href: feature.href as string }
            : {};
        return (
          <Wrapper
            key={feature.title}
            {...(wrapperProps as Record<string, string>)}
            className="block"
          >
            <Card className="group relative h-full border-border bg-card/90 transition-colors hover:border-zen-teal/30 overflow-hidden">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(20,184,166,0.15)_0%,rgba(15,23,42,0)_60%)]" />
              <CardHeader>
                <div className="relative z-10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zen-teal/10">
                  <feature.icon className="h-5 w-5 text-zen-teal" />
                </div>
                <CardTitle className="relative z-10 text-foreground text-lg">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="relative z-10 text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Wrapper>
        );
      })}
    </div>
  );
}
