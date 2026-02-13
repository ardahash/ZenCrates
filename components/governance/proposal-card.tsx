"use client";

// TODO: Replace with real governance contract vote calls

import type { Proposal } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAccount } from "wagmi";

const STATUS_STYLES: Record<string, string> = {
  active: "border-zen-teal/40 text-zen-teal",
  passed: "border-chart-2/40 text-chart-2",
  rejected: "border-destructive/40 text-destructive",
  pending: "border-chart-4/40 text-chart-4",
};

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const { isConnected } = useAccount();
  const [expanded, setExpanded] = useState(false);

  const totalVotes =
    proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const forPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const againstPercent =
    totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;

  const handleVote = (vote: "for" | "against" | "abstain") => {
    // TODO: Execute real governance contract vote
    toast.success(
      `Vote "${vote}" submitted for ${proposal.title} (placeholder)`
    );
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={cn(
                  "capitalize text-xs",
                  STATUS_STYLES[proposal.status]
                )}
              >
                {proposal.status}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {proposal.id}
              </span>
            </div>
            <CardTitle className="text-foreground text-base">
              {proposal.title}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            {expanded ? "Show less" : "Show more"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {expanded && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {proposal.description}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>
                Proposer:{" "}
                <span className="font-mono text-foreground">
                  {proposal.proposer}
                </span>
              </span>
              <span>
                Created:{" "}
                {new Date(proposal.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>
                Ends:{" "}
                {new Date(proposal.endsAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        )}

        {/* Vote bars */}
        <div className="flex flex-col gap-3 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zen-teal">For</span>
              <span className="text-xs text-muted-foreground font-mono">
                {proposal.votesFor.toLocaleString()} ({forPercent.toFixed(1)}%)
              </span>
            </div>
            <Progress
              value={forPercent}
              className="h-2 bg-muted [&>div]:bg-zen-teal"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-destructive">Against</span>
              <span className="text-xs text-muted-foreground font-mono">
                {proposal.votesAgainst.toLocaleString()} (
                {againstPercent.toFixed(1)}%)
              </span>
            </div>
            <Progress
              value={againstPercent}
              className="h-2 bg-muted [&>div]:bg-destructive"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Abstain: {proposal.votesAbstain.toLocaleString()} | Total:{" "}
            {totalVotes.toLocaleString()} votes
          </p>
        </div>

        {/* Vote buttons */}
        {proposal.status === "active" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleVote("for")}
              disabled={!isConnected}
              className="flex-1 bg-zen-teal text-background hover:bg-zen-teal/90 text-xs"
            >
              Vote For
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleVote("against")}
              disabled={!isConnected}
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 text-xs"
            >
              Vote Against
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleVote("abstain")}
              disabled={!isConnected}
              className="flex-1 border-border text-muted-foreground hover:text-foreground text-xs"
            >
              Abstain
            </Button>
          </div>
        )}

        {proposal.status === "active" && !isConnected && (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Connect your wallet to vote.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
