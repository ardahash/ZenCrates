import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zen-teal/10 overflow-hidden">
                <Image
                  src="/zkGold-250.png"
                  alt="ZenCrates logo"
                  width={28}
                  height={28}
                />
              </div>
              <span className="text-base font-semibold text-foreground">
                ZenCrates
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              ZenCrates provides software for on-chain synthetic exposure
              and rules-based strategy vaults. Not financial advice. No
              custody, no redemption promises.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-foreground">
              Protocol
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/crates"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Explore Crates
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/stats"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Stats
                </Link>
              </li>
              <li>
                <Link
                  href="/governance"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Governance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-foreground">
              Resources
            </h4>
            <ul className="flex flex-col gap-2">
              {/* TODO: link to real docs */}
              <li>
                <span className="text-sm text-muted-foreground/60 cursor-not-allowed">
                  Documentation (Soon)
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground/60 cursor-not-allowed">
                  GitHub (Soon)
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground/60 cursor-not-allowed">
                  Audits (Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            ZenCrates is experimental DeFi software on Horizen L3. Use at
            your own risk. This interface does not constitute financial
            advice, an offer to sell, or a solicitation of an offer to
            purchase any securities or financial instruments. Past
            performance is not indicative of future outcomes. Smart contract
            risk, oracle risk, and market risk apply.
          </p>
        </div>
      </div>
    </footer>
  );
}
