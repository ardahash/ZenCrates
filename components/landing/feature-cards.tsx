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
      "Every price feed, every data source — visible on-chain. Combining decentralized oracle networks with curated off-chain endpoints for reliable data.",
  },
  {
    icon: Percent,
    title: "Hold CRATES for Fee Rebates",
    description:
      "Hold the CRATES utility token to unlock tiered fee discounts on protocol operations. Rebates are governance-controlled program parameters — not yield or investment returns.",
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
            <Card className="border-border bg-card h-full transition-colors hover:border-zen-teal/30">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zen-teal/10">
                  <feature.icon className="h-5 w-5 text-zen-teal" />
                </div>
                <CardTitle className="text-foreground text-lg">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
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
