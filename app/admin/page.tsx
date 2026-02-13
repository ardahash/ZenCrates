"use client";

// TODO: Replace with real admin role check from contract / multisig
// TODO: All admin actions require multisig / timelock (implemented later)

import { useQuery } from "@tanstack/react-query";
import type { Crate } from "@/lib/types";
import { L3_ADDRESSES } from "@/lib/addresses";
import { backendBaseUrl } from "@/lib/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  ShieldAlert,
  Pause,
  Play,
  Plus,
  Radio,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [paused, setPaused] = useState(false);
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();
  const isAdmin =
    !!adminAddress && isConnected && address?.toLowerCase() === adminAddress;

  const { data: crates } = useQuery<Crate[]>({
    queryKey: ["crates"],
    queryFn: () => fetch("/api/crates").then((r) => r.json()),
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Access Denied
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              This page requires admin access. Connect your wallet with the
              admin address to access protocol management.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handlePauseToggle = () => {
    // TODO: Execute real pause/unpause contract call via multisig
    setPaused(!paused);
    toast.success(
      `Protocol ${paused ? "unpaused" : "paused"} (placeholder - requires multisig)`
    );
  };

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-zen-teal" />
            <h1 className="text-3xl font-bold text-foreground">
              Admin Panel
            </h1>
          </div>
          <p className="text-muted-foreground">
            Protocol management and configuration.
          </p>
          <div className="mt-3 rounded-md bg-chart-4/10 border border-chart-4/20 p-3 inline-flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-chart-4" />
            <p className="text-xs text-muted-foreground">
              Admin actions require multisig / timelock (implemented later).
              Changes shown here are placeholder demonstrations only.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Emergency Controls */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Emergency Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-foreground">Protocol Status</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        paused ? "bg-destructive" : "bg-zen-teal"
                      }`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {paused ? "Paused" : "Active"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handlePauseToggle}
                  className={
                    paused
                      ? "border-zen-teal/30 text-zen-teal hover:bg-zen-teal/10"
                      : "border-destructive/30 text-destructive hover:bg-destructive/10"
                  }
                >
                  {paused ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Unpause Protocol
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Protocol
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manage Crates */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base">
                  Manage Crates
                </CardTitle>
                <CreateCrateDialog />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Category</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Contract</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(crates ?? []).map((crate) => (
                      <TableRow key={crate.id} className="border-border">
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {crate.name}
                            </p>
                            <p className="text-xs font-mono text-muted-foreground">
                              {crate.ticker}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-border text-muted-foreground capitalize text-xs"
                          >
                            {crate.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              crate.isActive
                                ? "border-zen-teal/40 text-zen-teal text-xs"
                                : "border-destructive/40 text-destructive text-xs"
                            }
                          >
                            {crate.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs font-mono text-muted-foreground">
                            {crate.contractAddress.slice(0, 10)}...
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              toast.info(
                                "Edit crate functionality coming soon (requires multisig)"
                              )
                            }
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!crates || crates.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                          No crates loaded yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Oracle Configuration */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground text-base flex items-center gap-2">
                <Radio className="h-4 w-4 text-muted-foreground" />
                Oracle Configuration (Read-Only)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded bg-muted px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Oracle Registry
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Central registry for all oracle feeds
                    </p>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">
                    {L3_ADDRESSES?.signedPriceOracle ?? "Not deployed"}
                  </code>
                </div>
                <div className="flex items-center justify-between rounded bg-muted px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Oracle Endpoint
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Off-chain oracle aggregator
                    </p>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">
                    {backendBaseUrl()}/api/prices
                  </code>
                </div>
                <div className="flex items-center justify-between rounded bg-muted px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      RPC URL
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Network RPC endpoint
                    </p>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">
                    https://horizen.calderachain.xyz/http
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CreateCrateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-zen-teal text-background hover:bg-zen-teal/90 text-xs"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create Crate
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Crate</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Define a new crate for the protocol. This action requires
            multisig approval.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div>
            <Label htmlFor="crate-name" className="text-foreground text-sm">
              Name
            </Label>
            <Input
              id="crate-name"
              placeholder="e.g., Commodities Basket"
              className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label htmlFor="crate-ticker" className="text-foreground text-sm">
              Ticker
            </Label>
            <Input
              id="crate-ticker"
              placeholder="e.g., zCOMM"
              className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground font-mono"
            />
          </div>
          <div>
            <Label htmlFor="crate-desc" className="text-foreground text-sm">
              Description
            </Label>
            <Textarea
              id="crate-desc"
              placeholder="Describe the crate's purpose and strategy..."
              className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() =>
              toast.info(
                "Create crate submitted (placeholder - requires multisig)"
              )
            }
            className="bg-zen-teal text-background hover:bg-zen-teal/90"
          >
            Submit for Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}