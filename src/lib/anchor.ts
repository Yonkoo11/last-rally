import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PROGRAM_ID, SOLANA_RPC_URL } from './solana';
import idl from '../idl/last_rally.json';

// Singleton connection
let _connection: Connection | null = null;
export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }
  return _connection;
}

// Create Anchor provider from wallet adapter
export function getProvider(wallet: AnchorWallet): AnchorProvider {
  return new AnchorProvider(getConnection(), wallet, {
    commitment: 'confirmed',
  });
}

// Get program instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProgram(wallet: AnchorWallet): Program {
  const provider = getProvider(wallet);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Program(idl as any, provider);
}

// PDA derivations
export function getMatchPDA(matchId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('match'), matchId.toArrayLike(Buffer, 'le', 8)],
    PROGRAM_ID
  );
}

export function getPlayerPDA(wallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('player'), wallet.toBuffer()],
    PROGRAM_ID
  );
}

// Generate a unique match ID from timestamp + random
export function generateMatchId(): BN {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return new BN(timestamp * 1000 + random);
}

export { BN, SystemProgram };
