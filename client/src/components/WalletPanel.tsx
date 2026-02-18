import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import CollapsiblePanel from './CollapsiblePanel';
import { getWalletNonce, verifyWallet, disconnectWallet, getWalletBalance, getWalletStatus } from '../services/api';

interface WalletPanelProps {
  inline?: boolean;
  bare?: boolean;
  onConnected?: (address: string) => void;
  onSkipped?: () => void;
}

export default function WalletPanel({ inline, bare, onConnected, onSkipped }: WalletPanelProps) {
  const { address, isConnected } = useAccount();
  const { connectors: allConnectors, connect } = useConnect();
  const connectors = allConnectors.filter(
    (c) => c.name === 'MetaMask' || c.name === 'WalletConnect'
  );
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();

  const [linkedAddress, setLinkedAddress] = useState<string | null>(null);
  const [balanceEth, setBalanceEth] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Check for existing linked wallet on mount
  useEffect(() => {
    getWalletStatus()
      .then(({ data }) => {
        if (data.walletAddress) setLinkedAddress(data.walletAddress);
      })
      .catch(() => {});
  }, []);

  // Fetch balance when address is linked
  useEffect(() => {
    if (linkedAddress) {
      getWalletBalance()
        .then(({ data }) => setBalanceEth(data.balanceEth))
        .catch(() => setBalanceEth(null));
    }
  }, [linkedAddress]);

  const handleVerify = async () => {
    if (!address) return;
    setError('');
    setVerifying(true);

    try {
      // 1. Switch to Ethereum mainnet if needed
      await switchChainAsync({ chainId: mainnet.id });

      // 2. Fetch nonce from server
      const { data: nonceData } = await getWalletNonce();

      // 3. Build EIP-4361 SIWE message
      const domain = window.location.host;
      const origin = window.location.origin;
      const message = [
        `${domain} wants you to sign in with your Ethereum account:`,
        address,
        '',
        'Link your wallet to Cosmic Horizon.',
        '',
        `URI: ${origin}`,
        'Version: 1',
        `Chain ID: 1`,
        `Nonce: ${nonceData.nonce}`,
        `Issued At: ${new Date().toISOString()}`,
      ].join('\n');

      // 4. Request signature from wallet
      const signature = await signMessageAsync({ message });

      // 5. Verify on server
      const { data } = await verifyWallet(message, signature);
      setLinkedAddress(data.walletAddress);
      onConnected?.(data.walletAddress);
    } catch (err: any) {
      if (err?.code === 4001 || err?.message?.includes('User rejected')) {
        setError('Signature rejected');
      } else if (err?.response?.status === 409) {
        setError('Wallet already linked to another account');
      } else {
        setError(err?.response?.data?.error || 'Verification failed');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      wagmiDisconnect();
      setLinkedAddress(null);
      setBalanceEth(null);
      setError('');
    } catch {
      setError('Failed to disconnect');
    }
  };

  const content = (
    <div className="wallet-panel">
      {error && <div className="wallet-error">{error}</div>}

      {linkedAddress ? (
        <div className="wallet-connected">
          <div className="wallet-address">
            <span className="wallet-address__label">ADDRESS</span>
            <span className="wallet-address__value">
              {linkedAddress.slice(0, 6)}...{linkedAddress.slice(-4)}
            </span>
          </div>
          <div className="wallet-balance">
            <span className="wallet-balance__label">ETH BALANCE</span>
            <span className="wallet-balance__value">
              {balanceEth !== null ? `${parseFloat(balanceEth).toFixed(4)} ETH` : '...'}
            </span>
          </div>
          <div className="wallet-web3-hint">
            Web3 features coming soon
          </div>
          <button className="btn btn-sm wallet-disconnect" onClick={handleDisconnect}>
            DISCONNECT
          </button>
        </div>
      ) : isConnected && address ? (
        <div className="wallet-verify">
          <div className="wallet-address">
            <span className="wallet-address__label">CONNECTED</span>
            <span className="wallet-address__value">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? 'VERIFYING...' : 'VERIFY & LINK'}
          </button>
        </div>
      ) : (
        <div className="wallet-connect">
          <p className="text-muted" style={{ fontSize: '11px', marginBottom: '8px' }}>
            Link an Ethereum wallet for future web3 gameplay features.
          </p>
          <div className="wallet-connectors">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                className="btn btn-sm wallet-connector-btn"
                onClick={() => {
                  setError('');
                  connect({ connector, chainId: mainnet.id }, {
                    onError: (err) => setError(err.message || 'Connection failed'),
                  });
                }}
              >
                {connector.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {inline && !linkedAddress && (
        <div className="wallet-skip">
          <button className="btn btn-secondary btn-sm" onClick={onSkipped}>
            SKIP FOR NOW
          </button>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="wallet-step">
        <h3 className="wallet-step__title">LINK ETHEREUM WALLET</h3>
        <p className="wallet-step__subtitle">Optional — connect a wallet for future web3 features</p>
        {content}
      </div>
    );
  }

  if (bare) return <div className="panel-content">{content}</div>;

  return (
    <CollapsiblePanel
      title="ETHEREUM WALLET"
      badge={linkedAddress ? '\u2713' : null}
    >
      {content}
    </CollapsiblePanel>
  );
}
