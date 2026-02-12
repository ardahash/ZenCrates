// ============================================================
// ZenCrates Global Store (Zustand)
// TODO: Integrate real wallet connection via wagmi/viem
// ============================================================

import { create } from "zustand";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isAdmin: boolean; // TODO: Replace with real role check from contract/backend
  cratesBalance: number; // TODO: Replace with real ERC-20 read
  cratesTier: number; // TODO: Derive from real balance + tier rules
}

interface AppState {
  wallet: WalletState;
  connectWallet: () => void;
  disconnectWallet: () => void;
  toggleAdmin: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  wallet: {
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isAdmin: false,
    cratesBalance: 0,
    cratesTier: 0,
  },

  // TODO: Replace with real wagmi wallet connect
  connectWallet: () =>
    set({
      wallet: {
        isConnected: true,
        address: "0x71C7...93Fe", // Placeholder
        balance: "12,450.00 USDC", // Placeholder
        chainId: 0, // TODO: real chain ID
        isAdmin: false,
        cratesBalance: 12500, // TODO: Replace with real ERC-20 balanceOf read
        cratesTier: 2, // TODO: Derive from balance + tier lookup
      },
    }),

  disconnectWallet: () =>
    set({
      wallet: {
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
        isAdmin: false,
        cratesBalance: 0,
        cratesTier: 0,
      },
    }),

  // Placeholder for demo only
  toggleAdmin: () =>
    set((state) => ({
      wallet: {
        ...state.wallet,
        isAdmin: !state.wallet.isAdmin,
      },
    })),
}));
