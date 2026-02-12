"use client";

import { useQuery } from "@tanstack/react-query";
import type { Crate, CrateCategory } from "@/lib/types";
import { CrateCard } from "@/components/crates/crate-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

type SortOption = "tvl" | "price" | "change";

export default function ExploreCratesPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("tvl");
  const [tab, setTab] = useState<string>("all");

  const { data, isLoading } = useQuery<{ crates: Crate[] }>({
    queryKey: ["crates"],
    queryFn: () => fetch("/api/crates").then((r) => r.json()),
  });

  const crates = data?.crates ?? [];

  const filtered = useMemo(() => {
    let result = [...crates];

    // Filter by tab
    if (tab !== "all") {
      result = result.filter((c) => c.category === (tab as CrateCategory));
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.ticker.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case "tvl":
          return b.tvl - a.tvl;
        case "price":
          return b.currentPrice - a.currentPrice;
        case "change":
          return b.priceChange24h - a.priceChange24h;
        default:
          return 0;
      }
    });

    return result;
  }, [crates, tab, search, sort]);

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Explore Crates</h1>
          <p className="mt-2 text-muted-foreground">
            Browse synthetic exposure tokens and strategy vaults.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="exposure">Exposure</TabsTrigger>
              <TabsTrigger value="strategy">Strategies</TabsTrigger>
              <TabsTrigger value="signal-nft" disabled>
                Signal NFTs (Soon)
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search crates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-56 bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortOption)}
              >
                <SelectTrigger className="w-36 bg-card border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="tvl">Sort by TVL</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="change">Sort by 24h %</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {["all", "exposure", "strategy", "signal-nft"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 rounded-lg" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground">
                    No crates found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((crate) => (
                    <CrateCard key={crate.id} crate={crate} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
