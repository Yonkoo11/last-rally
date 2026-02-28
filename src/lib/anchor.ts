import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PROGRAM_ID, SOLANA_RPC_URL, MAGICBLOCK_ROUTER } from './solana';
import idl from '../idl/last_rally.json';

// MagicBlock program IDs
export const DELEGATION_PROGRAM_ID = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh');
export const MAGIC_PROGRAM_ID = new PublicKey('Magic11111111111111111111111111111111111111');
export const MAGIC_CONTEXT_ID = new PublicKey('MagicContext1111111111111111111111111111111');

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
// Buffer PDA is derived from the OWNER program (our game), not the delegation program
export function getDelegationBufferPDA(delegatedAccount: PublicKey, ownerProgram: PublicKey = PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('buffer'), delegatedAccount.toBuffer()],
    ownerProgram
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

// Create a commit-and-undelegate instruction for MagicBlock ER
// This is sent to MAGIC_PROGRAM_ID via the ER router, not to our program
export function createCommitAndUndelegateInstruction(
  payer: PublicKey,
  accountsToUndelegate: PublicKey[]
): TransactionInstruction {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: MAGIC_CONTEXT_ID, isSigner: false, isWritable: true },
    ...accountsToUndelegate.map((account) => ({
      pubkey: account,
      isSigner: false,
      isWritable: false,
    })),
  ];

  const data = Buffer.alloc(4);
  data.writeUInt32LE(2, 0); // instruction index 2 = commit and undelegate

  return new TransactionInstruction({
    keys,
    programId: MAGIC_PROGRAM_ID,
    data,
  });
}

export { BN, SystemProgram };
