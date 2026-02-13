"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <Button
              onClick={openConnectModal}
              className="bg-zen-teal text-background hover:bg-zen-teal/90 font-medium"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={openChainModal}
              className="border-zen-teal/30 text-foreground hover:bg-zen-teal/10"
            >
              {chain.name}
            </Button>
            <Button
              variant="outline"
              onClick={openAccountModal}
              className="border-zen-teal/30 text-foreground hover:bg-zen-teal/10"
            >
              {account.displayName}
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
