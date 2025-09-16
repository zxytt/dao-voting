'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon } from 'wagmi/chains';
import { WagmiProvider, http } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// 使用 Sepolia 测试网
const chains = [sepolia];

export const config = getDefaultConfig({
    appName: 'DAO Voting System',
    projectId: '6e621d7a9f302055a5f8f4f5d6a1e404', // 从 https://cloud.walletconnect.com/ 获取
    chains,
    ssr: true,
    transports: {
        [sepolia.id]: http(
            `https://sepolia.infura.io/v3/02b0923c2cb8420f991d9b232bea0b35`
        ),
    },
});

const queryClient = new QueryClient();

export function WagmiContext({ children }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
