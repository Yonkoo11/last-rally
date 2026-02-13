import { ReactNode } from 'react';
import { WagmiProvider, http } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Configure chains - Fuji for testnet, Avalanche for mainnet
const config = getDefaultConfig({
  appName: 'Last Rally',
  projectId: 'last-rally-pong', // WalletConnect project ID (get from cloud.walletconnect.com)
  chains: [avalancheFuji, avalanche],
  transports: {
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
  },
  ssr: false,
});

const queryClient = new QueryClient();

// Custom theme matching Last Rally's dark aesthetic
const lastRallyTheme = darkTheme({
  accentColor: '#FFAA00', // Gold accent like CTA buttons
  accentColorForeground: '#0A0A0C',
  borderRadius: 'medium',
  fontStack: 'system',
});

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lastRallyTheme}
          modalSize="compact"
          initialChain={avalancheFuji}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
