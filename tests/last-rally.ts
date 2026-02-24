import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LastRally } from "../target/types/last_rally";
import { expect } from "chai";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("last-rally", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LastRally as Program<LastRally>;

  // Test wallets
  const player1 = anchor.web3.Keypair.generate();
  const player2 = anchor.web3.Keypair.generate();

  const WAGER_AMOUNT = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL
  const MATCH_ID = new anchor.BN(1);

  // PDA helpers
  function getMatchPDA(matchId: anchor.BN) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("match"), matchId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
  }

  function getPlayerPDA(wallet: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("player"), wallet.toBuffer()],
      program.programId
    );
  }

  before(async () => {
    // Airdrop SOL to test wallets
    const sig1 = await provider.connection.requestAirdrop(
      player1.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig1);

    const sig2 = await provider.connection.requestAirdrop(
      player2.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig2);
  });

  it("Initializes player profiles", async () => {
    const [player1PDA] = getPlayerPDA(player1.publicKey);
    const [player2PDA] = getPlayerPDA(player2.publicKey);

    await program.methods
      .initializePlayer()
      .accounts({
        playerProfile: player1PDA,
        player: player1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    await program.methods
      .initializePlayer()
      .accounts({
        playerProfile: player2PDA,
        player: player2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc();

    const profile1 = await program.account.playerProfile.fetch(player1PDA);
    expect(profile1.wallet.toBase58()).to.equal(player1.publicKey.toBase58());
    expect(profile1.totalWins).to.equal(0);
    expect(profile1.matchesPlayed).to.equal(0);

    const profile2 = await program.account.playerProfile.fetch(player2PDA);
    expect(profile2.wallet.toBase58()).to.equal(player2.publicKey.toBase58());
  });

  it("Creates a match with SOL wager", async () => {
    const [matchPDA] = getMatchPDA(MATCH_ID);

    const balanceBefore = await provider.connection.getBalance(player1.publicKey);

    await program.methods
      .createMatch(MATCH_ID, new anchor.BN(WAGER_AMOUNT))
      .accounts({
        matchAccount: matchPDA,
        player1: player1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    const matchAccount = await program.account.matchAccount.fetch(matchPDA);
    expect(matchAccount.player1.toBase58()).to.equal(player1.publicKey.toBase58());
    expect(matchAccount.wagerAmount.toNumber()).to.equal(WAGER_AMOUNT);
    expect(JSON.stringify(matchAccount.status)).to.include("waiting");

    // Verify SOL was transferred
    const balanceAfter = await provider.connection.getBalance(player1.publicKey);
    expect(balanceBefore - balanceAfter).to.be.greaterThan(WAGER_AMOUNT - 10000); // Account for rent
  });

  it("Player 2 joins the match", async () => {
    const [matchPDA] = getMatchPDA(MATCH_ID);

    const balanceBefore = await provider.connection.getBalance(player2.publicKey);

    await program.methods
      .joinMatch()
      .accounts({
        matchAccount: matchPDA,
        player2: player2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc();

    const matchAccount = await program.account.matchAccount.fetch(matchPDA);
    expect(matchAccount.player2.toBase58()).to.equal(player2.publicKey.toBase58());
    expect(JSON.stringify(matchAccount.status)).to.include("active");

    // Verify SOL was transferred
    const balanceAfter = await provider.connection.getBalance(player2.publicKey);
    expect(balanceBefore - balanceAfter).to.be.greaterThan(WAGER_AMOUNT - 10000);
  });

  it("Settles match - winner gets full pot", async () => {
    const [matchPDA] = getMatchPDA(MATCH_ID);
    const [player1PDA] = getPlayerPDA(player1.publicKey);
    const [player2PDA] = getPlayerPDA(player2.publicKey);

    const winner = player1.publicKey; // Player 1 wins
    const winnerBalanceBefore = await provider.connection.getBalance(player1.publicKey);

    await program.methods
      .settleMatch(winner, 5, 3) // Player 1 wins 5-3
      .accounts({
        matchAccount: matchPDA,
        caller: player1.publicKey,
        player1: player1.publicKey,
        player2: player2.publicKey,
        player1Profile: player1PDA,
        player2Profile: player2PDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    const matchAccount = await program.account.matchAccount.fetch(matchPDA);
    expect(matchAccount.winner.toBase58()).to.equal(player1.publicKey.toBase58());
    expect(matchAccount.player1Score).to.equal(5);
    expect(matchAccount.player2Score).to.equal(3);
    expect(JSON.stringify(matchAccount.status)).to.include("settled");

    // Winner should receive 2x wager (full pot)
    const winnerBalanceAfter = await provider.connection.getBalance(player1.publicKey);
    const gained = winnerBalanceAfter - winnerBalanceBefore;
    // Should gain approximately 2x wager minus tx fee
    expect(gained).to.be.greaterThan(WAGER_AMOUNT * 2 - 100000);

    // Check player profiles updated
    const profile1 = await program.account.playerProfile.fetch(player1PDA);
    expect(profile1.totalWins).to.equal(1);
    expect(profile1.matchesPlayed).to.equal(1);

    const profile2 = await program.account.playerProfile.fetch(player2PDA);
    expect(profile2.totalLosses).to.equal(1);
    expect(profile2.matchesPlayed).to.equal(1);
  });

  it("Creates and cancels a match (refund)", async () => {
    const cancelMatchId = new anchor.BN(2);
    const [matchPDA] = getMatchPDA(cancelMatchId);

    const balanceBefore = await provider.connection.getBalance(player1.publicKey);

    // Create match
    await program.methods
      .createMatch(cancelMatchId, new anchor.BN(WAGER_AMOUNT))
      .accounts({
        matchAccount: matchPDA,
        player1: player1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    // Cancel match (closes account, returns wager + rent)
    await program.methods
      .cancelMatch()
      .accounts({
        matchAccount: matchPDA,
        player1: player1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    // Account should be closed (no longer exists)
    const accountInfo = await provider.connection.getAccountInfo(matchPDA);
    expect(accountInfo).to.be.null;

    // Balance should be roughly restored (minus only tx fees)
    const balanceAfter = await provider.connection.getBalance(player1.publicKey);
    expect(balanceBefore - balanceAfter).to.be.lessThan(50000); // Only lost tx fees
  });

  it("Prevents joining own match", async () => {
    const selfMatchId = new anchor.BN(3);
    const [matchPDA] = getMatchPDA(selfMatchId);

    await program.methods
      .createMatch(selfMatchId, new anchor.BN(WAGER_AMOUNT))
      .accounts({
        matchAccount: matchPDA,
        player1: player1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    try {
      await program.methods
        .joinMatch()
        .accounts({
          matchAccount: matchPDA,
          player2: player1.publicKey, // Same player trying to join
          systemProgram: SystemProgram.programId,
        })
        .signers([player1])
        .rpc();
      expect.fail("Should have thrown");
    } catch (err: any) {
      expect(err.toString()).to.include("SelfMatch");
    }
  });

  it("Prevents cancelling after player 2 joins", async () => {
    const joinedMatchId = new anchor.BN(4);
    const [matchPDA] = getMatchPDA(joinedMatchId);

    await program.methods
      .createMatch(joinedMatchId, new anchor.BN(WAGER_AMOUNT))
      .accounts({
        matchAccount: matchPDA,
        player1: player1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    await program.methods
      .joinMatch()
      .accounts({
        matchAccount: matchPDA,
        player2: player2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc();

    try {
      await program.methods
        .cancelMatch()
        .accounts({
          matchAccount: matchPDA,
          player1: player1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player1])
        .rpc();
      expect.fail("Should have thrown");
    } catch (err: any) {
      expect(err.toString()).to.include("InvalidMatchStatus");
    }
  });
});
