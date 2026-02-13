import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { base } from "wagmi/chains";
import { defineChain } from "viem";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const horizenL3 = defineChain({
  id: 26514,
  name: "Horizen L3",
  network: "horizen-l3",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://horizen.calderachain.xyz/http"],
      webSocket: ["wss://horizen.calderachain.xyz/ws"],
    },
    public: {
      http: ["https://horizen.calderachain.xyz/http"],
    },
  },
  blockExplorers: {
    default: { name: "Caldera Explorer", url: "https://horizen.calderaexplorer.xyz" },
  },
});

export const wagmiConfig = getDefaultConfig({
  appName: "ZenCrates",
  projectId: projectId || "MISSING_PROJECT_ID",
  chains: [horizenL3, base],
  transports: {
    [horizenL3.id]: http(horizenL3.rpcUrls.default.http[0]),
    [base.id]: http(),
  },
  ssr: true,
});

export const walletConnectProjectId = projectId;
