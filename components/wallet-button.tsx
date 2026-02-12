"use client";

// TODO: Replace with real wagmi wallet connect integration
// This is a placeholder component that simulates wallet states

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, Shield } from "lucide-react";
import { toast } from "sonner";

export function WalletButton() {
  const { wallet, connectWallet, disconnectWallet, toggleAdmin } =
    useAppStore();

  if (!wallet.isConnected) {
    return (
      <Button
        onClick={connectWallet}
        className="bg-zen-teal text-background hover:bg-zen-teal/90 font-medium"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-zen-teal/30 text-foreground hover:bg-zen-teal/10"
        >
          <div className="h-2 w-2 rounded-full bg-zen-teal mr-2" />
          {wallet.address}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-card border-border"
      >
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-sm font-medium text-foreground">
            {wallet.balance}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(wallet.address || "");
            toast.success("Address copied to clipboard");
          }}
          className="cursor-pointer"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleAdmin} className="cursor-pointer">
          <Shield className="mr-2 h-4 w-4" />
          {wallet.isAdmin ? "Disable" : "Enable"} Admin Mode
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={disconnectWallet}
          className="cursor-pointer text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
