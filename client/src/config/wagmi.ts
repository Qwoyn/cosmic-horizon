import { http, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: { [mainnet.id]: http() },
});
