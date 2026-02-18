import { Router } from 'express';
import { generateNonce, SiweMessage } from 'siwe';
import { createPublicClient, http, formatEther } from 'viem';
import { mainnet } from 'viem/chains';
import { requireAuth } from '../middleware/auth';
import db from '../db/connection';

const router = Router();

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETH_RPC_URL || 'https://eth.llamarpc.com'),
});

// In-memory nonce store keyed by playerId (single-server deployment)
const nonceStore = new Map<string, { nonce: string; expires: number }>();

// All routes require authentication
router.use(requireAuth);

// Generate SIWE nonce
router.get('/nonce', (req, res) => {
  const nonce = generateNonce();
  const playerId = req.session.playerId!;
  // Store nonce with 5-minute expiry
  nonceStore.set(playerId, { nonce, expires: Date.now() + 5 * 60 * 1000 });
  res.json({ nonce });
});

// Verify SIWE signature and link wallet
router.post('/verify', async (req, res) => {
  try {
    const { message, signature } = req.body;
    if (!message || !signature) {
      return res.status(400).json({ error: 'Missing message or signature' });
    }

    const siweMessage = new SiweMessage(message);
    const { data: verified } = await siweMessage.verify({ signature });

    // Check nonce matches
    const playerId = req.session.playerId!;
    const stored = nonceStore.get(playerId);
    if (!stored || stored.nonce !== verified.nonce || stored.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    // Clear nonce after use (prevents replay)
    nonceStore.delete(playerId);

    const walletAddress = verified.address.toLowerCase();

    // Check if wallet is already linked to another account
    const existing = await db('players')
      .where({ wallet_address: walletAddress })
      .whereNot({ id: req.session.playerId })
      .first();

    if (existing) {
      return res.status(409).json({ error: 'Wallet already linked to another account' });
    }

    // Store wallet address on player
    await db('players').where({ id: req.session.playerId }).update({
      wallet_address: walletAddress,
      wallet_connected_at: db.fn.now(),
    });

    res.json({ walletAddress });
  } catch (err) {
    console.error('Wallet verify error:', err);
    res.status(400).json({ error: 'Signature verification failed' });
  }
});

// Disconnect wallet
router.post('/disconnect', async (req, res) => {
  try {
    await db('players').where({ id: req.session.playerId }).update({
      wallet_address: null,
      wallet_connected_at: null,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Wallet disconnect error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get ETH balance
router.get('/balance', async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player?.wallet_address) {
      return res.status(400).json({ error: 'No wallet connected' });
    }

    const balance = await publicClient.getBalance({
      address: player.wallet_address as `0x${string}`,
    });

    res.json({
      walletAddress: player.wallet_address,
      balanceEth: formatEther(balance),
    });
  } catch (err) {
    console.error('Wallet balance error:', err);
    res.json({ walletAddress: null, balanceEth: null });
  }
});

// Get wallet status
router.get('/status', async (req, res) => {
  try {
    const player = await db('players')
      .where({ id: req.session.playerId })
      .select('wallet_address', 'wallet_connected_at')
      .first();

    res.json({
      walletAddress: player?.wallet_address || null,
      connectedAt: player?.wallet_connected_at || null,
    });
  } catch (err) {
    console.error('Wallet status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
