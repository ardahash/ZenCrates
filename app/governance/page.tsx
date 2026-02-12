"use client";

// TODO: Replace with real governance contract reads

import { MOCK_PROPOSALS } from "@/lib/mock-data";
import { ProposalCard } from "@/components/governance/proposal-card";
import { RebateProgramPanel } from "@/components/governance/rebate-program-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export default function GovernancePage() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Governance</h1>
            <p className="mt-2 text-muted-foreground">
              Vote on proposals that shape the ZenCrates protocol.
            </p>
          </div>
          <Button
            disabled
            className="bg-zen-teal text-background hover:bg-zen-teal/90 self-start"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Proposal (Soon)
          </Button>
        </div>

        <Tabs defaultValue="proposals">
          <TabsList className="bg-muted mb-6">
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals">
            <div className="flex flex-col gap-4">
              {MOCK_PROPOSALS.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="programs">
            <RebateProgramPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
