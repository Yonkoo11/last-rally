import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PROGRAM_ID, SOLANA_RPC_URL, MAGICBLOCK_ROUTER } from './solana';
import idl from '../idl/last_rally.json';

// MagicBlock Delegation Program ID
export const DELEGATION_PROGRAM_ID = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh');

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

// MagicBlock delegation PDA helpers
export function getDelegationBufferPDA(delegatedAccount: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('buffer'), delegatedAccount.toBuffer()],
    DELEGATION_PROGRAM_ID
  );
}

export function getDelegationRecordPDA(delegatedAccount: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('delegation'), delegatedAccount.toBuffer()],
    DELEGATION_PROGRAM_ID
  );
}

export function getDelegationMetadataPDA(delegatedAccount: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('delegation-metadata'), delegatedAccount.toBuffer()],
    DELEGATION_PROGRAM_ID
  );
}

// MagicBlock Router connection for ER transactions
let _magicConnection: Connection | null = null;
export function getMagicConnection(): Connection {
  if (!_magicConnection) {
    _magicConnection = new Connection(MAGICBLOCK_ROUTER, 'confirmed');
  }
  return _magicConnection;
}

export { BN, SystemProgram };
