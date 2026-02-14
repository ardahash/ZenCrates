"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/wallet-button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/crates", label: "Explore" },
  { href: "/crates-token", label: "CRATES" },
  { href: "/rewards", label: "Rewards" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/stats", label: "Stats" },
  { href: "/governance", label: "Governance" },
  { href: "#", label: "Docs", disabled: true }, // TODO: link to real docs
];

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zen-teal/10 overflow-hidden">
              <Image
                src="/zkGold-250.png"
                alt="ZenCrates logo"
                width={32}
                height={32}
                priority
              />
            </div>
            <span className="text-lg font-semibold text-foreground">
              ZenCrates
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.disabled ? "#" : link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-zen-teal"
                    : "text-muted-foreground hover:text-foreground",
                  link.disabled &&
                    "pointer-events-none opacity-50"
                )}
                aria-disabled={link.disabled}
              >
                {link.label}
                {link.disabled && (
                  <span className="ml-1 text-xs opacity-60">
                    {"(Soon)"}
                  </span>
                )}
              </Link>
            ))}
            
          </nav>
        </div>

        <div className="hidden md:block">
          <WalletButton />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {open ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 bg-background border-border"
          >
            <nav className="mt-8 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.disabled ? "#" : link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-4 py-3 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-zen-teal/10 text-zen-teal"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    link.disabled && "pointer-events-none opacity-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="mt-4 px-4">
                <WalletButton />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
