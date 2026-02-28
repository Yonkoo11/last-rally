use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_lang::solana_program::instruction::{AccountMeta, Instruction};
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token::{self, Transfer};

declare_id!("BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG");

// MagicBlock Ephemeral Rollup constants
pub mod delegation_program {
    anchor_lang::declare_id!("DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh");
}

// Borsh-serialized args for the delegation program's delegate instruction
#[derive(AnchorSerialize)]
pub struct DelegateAccountArgs {
    pub commit_frequency_ms: u32,
    pub seeds: Vec<Vec<u8>>,
    pub validator: Option<Pubkey>,
}

// Match status enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum MatchStatus {
    Waiting,    // Player 1 created, waiting for Player 2
    Active,     // Both players joined, game in progress
    Settled,    // Game finished, winner paid
    Cancelled,  // Match cancelled, refunds issued
}

// Match account - holds wager state for a single match
#[account]
pub struct MatchAccount {
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub token_mint: Pubkey,  // System Program = SOL, otherwise = SPL token mint
    pub wager_amount: u64,
    pub status: MatchStatus,
    pub winner: Pubkey,
    pub player1_score: u8,
    pub player2_score: u8,
    pub created_at: i64,
    pub settled_at: i64,
    pub match_id: u64,
    pub bump: u8,
}

impl MatchAccount {
    pub const SIZE: usize = 8  // discriminator
        + 32  // player1
        + 32  // player2
        + 32  // token_mint
        + 8   // wager_amount
        + 1   // status (enum)
        + 32  // winner
        + 1   // player1_score
        + 1   // player2_score
        + 8   // created_at
        + 8   // settled_at
        + 8   // match_id
        + 1;  // bump

    pub fn is_spl_token(&self) -> bool {
        self.token_mint != system_program::ID
    }
}

// Player profile - tracks stats per wallet
#[account]
pub struct PlayerProfile {
    pub wallet: Pubkey,
    pub total_wins: u32,
    pub total_losses: u32,
    pub total_wagered: u64,
    pub total_earned: u64,
    pub matches_played: u32,
    pub bump: u8,
}

impl PlayerProfile {
    pub const SIZE: usize = 8  // discriminator
        + 32  // wallet
        + 4   // total_wins
        + 4   // total_losses
        + 8   // total_wagered
        + 8   // total_earned
        + 4   // matches_played
        + 1;  // bump
}

// Custom errors
#[error_code]
pub enum LastRallyError {
    #[msg("Match is not in the expected status")]
    InvalidMatchStatus,
    #[msg("Only the match creator can cancel")]
    UnauthorizedCancel,
    #[msg("Cannot settle: not a participant")]
    NotParticipant,
    #[msg("Winner must be a match participant")]
    InvalidWinner,
    #[msg("Wager amount must be greater than zero")]
    ZeroWager,
    #[msg("Insufficient funds for wager")]
    InsufficientFunds,
    #[msg("Cannot join your own match")]
    SelfMatch,
    #[msg("Invalid delegation program")]
    InvalidDelegationProgram,
    #[msg("Serialization error")]
    SerializationError,
}

#[program]
pub mod last_rally {
    use super::*;

    /// Initialize a player profile PDA
    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        let profile = &mut ctx.accounts.player_profile;
        profile.wallet = ctx.accounts.player.key();
        profile.total_wins = 0;
        profile.total_losses = 0;
        profile.total_wagered = 0;
        profile.total_earned = 0;
        profile.matches_played = 0;
        profile.bump = ctx.bumps.player_profile;
        Ok(())
    }

    /// Create a new match with SOL or SPL token wager. Player 1 deposits wager into escrow.
    pub fn create_match(
        ctx: Context<CreateMatch>,
        match_id: u64,
        wager_amount: u64,
        token_mint: Pubkey,
    ) -> Result<()> {
        require!(wager_amount > 0, LastRallyError::ZeroWager);

        let match_account = &mut ctx.accounts.match_account;
        match_account.player1 = ctx.accounts.player1.key();
        match_account.player2 = Pubkey::default();
        match_account.token_mint = token_mint;
        match_account.wager_amount = wager_amount;
        match_account.status = MatchStatus::Waiting;
        match_account.winner = Pubkey::default();
        match_account.player1_score = 0;
        match_account.player2_score = 0;
        match_account.created_at = Clock::get()?.unix_timestamp;
        match_account.settled_at = 0;
        match_account.match_id = match_id;
        match_account.bump = ctx.bumps.match_account;

        // Transfer wager based on token type
        if token_mint == system_program::ID {
            // Native SOL transfer to match PDA
            system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    system_program::Transfer {
                        from: ctx.accounts.player1.to_account_info(),
                        to: match_account.to_account_info(),
                    },
                ),
                wager_amount,
            )?;
        } else {
            // SPL token transfer to escrow token account
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.player1_token_account.to_account_info(),
                        to: ctx.accounts.escrow_token_account.to_account_info(),
                        authority: ctx.accounts.player1.to_account_info(),
                    },
                ),
                wager_amount,
            )?;
        }

        Ok(())
    }

    /// Player 2 joins an existing match, depositing matching wager.
    pub fn join_match(ctx: Context<JoinMatch>) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;

        require!(
            match_account.status == MatchStatus::Waiting,
            LastRallyError::InvalidMatchStatus
        );
        require!(
            ctx.accounts.player2.key() != match_account.player1,
            LastRallyError::SelfMatch
        );

        let wager = match_account.wager_amount;

        // Transfer matching wager based on token type
        if match_account.token_mint == system_program::ID {
            // Native SOL transfer to match PDA
            system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    system_program::Transfer {
                        from: ctx.accounts.player2.to_account_info(),
                        to: match_account.to_account_info(),
                    },
                ),
                wager,
            )?;
        } else {
            // SPL token transfer to escrow
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.player2_token_account.to_account_info(),
                        to: ctx.accounts.escrow_token_account.to_account_info(),
                        authority: ctx.accounts.player2.to_account_info(),
                    },
                ),
                wager,
            )?;
        }

        match_account.player2 = ctx.accounts.player2.key();
        match_account.status = MatchStatus::Active;

        Ok(())
    }

    /// Settle the match: declare winner, transfer pot.
    /// For hackathon: winner is determined by the WebSocket server / client consensus.
    /// In production: this would use an oracle or the ER state.
    pub fn settle_match(
        ctx: Context<SettleMatch>,
        winner: Pubkey,
        player1_score: u8,
        player2_score: u8,
    ) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;

        require!(
            match_account.status == MatchStatus::Active,
            LastRallyError::InvalidMatchStatus
        );

        // Winner must be player1 or player2
        require!(
            winner == match_account.player1 || winner == match_account.player2,
            LastRallyError::InvalidWinner
        );

        // Caller must be a participant
        let caller = ctx.accounts.caller.key();
        require!(
            caller == match_account.player1 || caller == match_account.player2,
            LastRallyError::NotParticipant
        );

        let pot = match_account.wager_amount * 2;
        let match_id = match_account.match_id;
        let is_spl = match_account.is_spl_token();

        // Transfer pot to winner based on token type
        if is_spl {
            // SPL token transfer from escrow to winner's token account
            let winner_token_account = if winner == match_account.player1 {
                &ctx.accounts.player1_token_account
            } else {
                &ctx.accounts.player2_token_account
            };

            let match_id_bytes = match_id.to_le_bytes();
            let seeds = &[
                b"match".as_ref(),
                match_id_bytes.as_ref(),
                &[match_account.bump],
            ];
            let signer = &[&seeds[..]];

            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.escrow_token_account.to_account_info(),
                        to: winner_token_account.to_account_info(),
                        authority: match_account.to_account_info(),
                    },
                    signer,
                ),
                pot,
            )?;
        } else {
            // Native SOL transfer from match PDA to winner
            let match_info = match_account.to_account_info();
            **match_info.try_borrow_mut_lamports()? -= pot;

            if winner == match_account.player1 {
                **ctx.accounts.player1.to_account_info().try_borrow_mut_lamports()? += pot;
            } else {
                **ctx.accounts.player2.to_account_info().try_borrow_mut_lamports()? += pot;
            }
        }

        match_account.winner = winner;
        match_account.player1_score = player1_score;
        match_account.player2_score = player2_score;
        match_account.status = MatchStatus::Settled;
        match_account.settled_at = Clock::get()?.unix_timestamp;

        // Update player profiles
        let p1_profile = &mut ctx.accounts.player1_profile;
        let p2_profile = &mut ctx.accounts.player2_profile;

        p1_profile.matches_played += 1;
        p2_profile.matches_played += 1;
        p1_profile.total_wagered += match_account.wager_amount;
        p2_profile.total_wagered += match_account.wager_amount;

        if winner == match_account.player1 {
            p1_profile.total_wins += 1;
            p1_profile.total_earned += pot;
            p2_profile.total_losses += 1;
        } else {
            p2_profile.total_wins += 1;
            p2_profile.total_earned += pot;
            p1_profile.total_losses += 1;
        }

        Ok(())
    }

    /// Cancel a match (only if still Waiting). Refunds wager + closes account.
    pub fn cancel_match(ctx: Context<CancelMatch>) -> Result<()> {
        let match_account = &ctx.accounts.match_account;

        require!(
            match_account.status == MatchStatus::Waiting,
            LastRallyError::InvalidMatchStatus
        );
        require!(
            ctx.accounts.player1.key() == match_account.player1,
            LastRallyError::UnauthorizedCancel
        );

        // Refund wager based on token type
        if match_account.is_spl_token() {
            // SPL token refund from escrow to player1
            let match_id = match_account.match_id;
            let match_id_bytes = match_id.to_le_bytes();
            let seeds = &[
                b"match".as_ref(),
                match_id_bytes.as_ref(),
                &[match_account.bump],
            ];
            let signer = &[&seeds[..]];

            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.escrow_token_account.to_account_info(),
                        to: ctx.accounts.player1_token_account.to_account_info(),
                        authority: match_account.to_account_info(),
                    },
                    signer,
                ),
                match_account.wager_amount,
            )?;
        }
        // For SOL, account close via `close = player1` returns all lamports (wager + rent)

        Ok(())
    }

    /// Delegate match account to MagicBlock Ephemeral Rollup for low-latency gameplay.
    /// Called after joinMatch when status is Active.
    pub fn delegate_match(ctx: Context<DelegateMatch>) -> Result<()> {
        let match_account = &ctx.accounts.match_account;

        require!(
            match_account.status == MatchStatus::Active,
            LastRallyError::InvalidMatchStatus
        );

        // Caller must be a participant
        let caller = ctx.accounts.payer.key();
        require!(
            caller == match_account.player1 || caller == match_account.player2,
            LastRallyError::NotParticipant
        );

        // Validate delegation program
        require!(
            ctx.accounts.delegation_program.key() == delegation_program::ID,
            LastRallyError::InvalidDelegationProgram
        );

        let match_id_bytes = match_account.match_id.to_le_bytes();

        // Build delegation args
        let args = DelegateAccountArgs {
            commit_frequency_ms: 30_000,
            seeds: vec![b"match".to_vec(), match_id_bytes.to_vec()],
            validator: None,
        };

        // Serialize: 8-byte discriminator (0 = delegate) + borsh(args)
        let mut instruction_data = vec![0u8; 8]; // discriminator = 0
        args.serialize(&mut instruction_data)
            .map_err(|_| error!(LastRallyError::SerializationError))?;

        let delegation_ix = Instruction {
            program_id: delegation_program::ID,
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new(ctx.accounts.match_account.key(), true),
                AccountMeta::new_readonly(ctx.accounts.owner_program.key(), false),
                AccountMeta::new(ctx.accounts.buffer.key(), false),
                AccountMeta::new(ctx.accounts.delegation_record.key(), false),
                AccountMeta::new(ctx.accounts.delegation_metadata.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
            ],
            data: instruction_data,
        };

        // Sign with the match PDA seeds
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"match",
            match_id_bytes.as_ref(),
            &[match_account.bump],
        ]];

        invoke_signed(
            &delegation_ix,
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.match_account.to_account_info(),
                ctx.accounts.owner_program.to_account_info(),
                ctx.accounts.buffer.to_account_info(),
                ctx.accounts.delegation_record.to_account_info(),
                ctx.accounts.delegation_metadata.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;

        msg!("Match {} delegated to MagicBlock ER", match_account.match_id);
        Ok(())
    }

    /// Undelegate match account from Ephemeral Rollup back to Solana L1.
    /// Called from within the ER before settleMatch to finalize state on-chain.
    pub fn undelegate_match(ctx: Context<UndelegateMatch>) -> Result<()> {
        let match_account = &ctx.accounts.match_account;

        // Caller must be a participant
        let caller = ctx.accounts.payer.key();
        require!(
            caller == match_account.player1 || caller == match_account.player2,
            LastRallyError::NotParticipant
        );

        // Validate delegation program
        require!(
            ctx.accounts.delegation_program.key() == delegation_program::ID,
            LastRallyError::InvalidDelegationProgram
        );

        let match_id_bytes = match_account.match_id.to_le_bytes();

        // Build undelegate instruction (discriminator = 1)
        let mut instruction_data = vec![0u8; 8];
        instruction_data[0] = 1; // undelegate discriminator

        // Serialize seeds for the undelegation
        let seeds: Vec<Vec<u8>> = vec![b"match".to_vec(), match_id_bytes.to_vec()];
        seeds.serialize(&mut instruction_data)
            .map_err(|_| error!(LastRallyError::SerializationError))?;

        let undelegate_ix = Instruction {
            program_id: delegation_program::ID,
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new(ctx.accounts.match_account.key(), true),
                AccountMeta::new_readonly(ctx.accounts.owner_program.key(), false),
                AccountMeta::new(ctx.accounts.buffer.key(), false),
                AccountMeta::new(ctx.accounts.delegation_record.key(), false),
                AccountMeta::new(ctx.accounts.delegation_metadata.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
            ],
            data: instruction_data,
        };

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"match",
            match_id_bytes.as_ref(),
            &[match_account.bump],
        ]];

        invoke_signed(
            &undelegate_ix,
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.match_account.to_account_info(),
                ctx.accounts.owner_program.to_account_info(),
                ctx.accounts.buffer.to_account_info(),
                ctx.accounts.delegation_record.to_account_info(),
                ctx.accounts.delegation_metadata.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;

        msg!("Match {} undelegated from MagicBlock ER", match_account.match_id);
        Ok(())
    }
}

// ============================================
// Account contexts
// ============================================

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(
        init,
        payer = player,
        space = PlayerProfile::SIZE,
        seeds = [b"player", player.key().as_ref()],
        bump,
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(match_id: u64, wager_amount: u64, token_mint: Pubkey)]
pub struct CreateMatch<'info> {
    #[account(
        init,
        payer = player1,
        space = MatchAccount::SIZE,
        seeds = [b"match", match_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub player1: Signer<'info>,

    /// CHECK: SPL mint account - only validated for SPL token wagers, skipped for SOL
    pub mint: UncheckedAccount<'info>,
    /// CHECK: SPL escrow token account - only used for SPL token wagers
    #[account(mut)]
    pub escrow_token_account: UncheckedAccount<'info>,
    /// CHECK: Player 1 token account - only used for SPL token wagers
    #[account(mut)]
    pub player1_token_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    /// CHECK: Token program - passed for SPL wagers, can be any account for SOL wagers
    pub token_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct JoinMatch<'info> {
    #[account(mut)]
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub player2: Signer<'info>,

    /// CHECK: SPL mint account - only validated for SPL token wagers
    pub mint: UncheckedAccount<'info>,
    /// CHECK: SPL escrow token account - only used for SPL token wagers
    #[account(mut)]
    pub escrow_token_account: UncheckedAccount<'info>,
    /// CHECK: Player 2 token account - only used for SPL token wagers
    #[account(mut)]
    pub player2_token_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    /// CHECK: Token program - passed for SPL wagers
    pub token_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct SettleMatch<'info> {
    #[account(mut)]
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub caller: Signer<'info>,
    /// CHECK: Player 1 wallet, validated against match_account.player1
    #[account(mut)]
    pub player1: UncheckedAccount<'info>,
    /// CHECK: Player 2 wallet, validated against match_account.player2
    #[account(mut)]
    pub player2: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"player", match_account.player1.as_ref()],
        bump = player1_profile.bump,
    )]
    pub player1_profile: Account<'info, PlayerProfile>,
    #[account(
        mut,
        seeds = [b"player", match_account.player2.as_ref()],
        bump = player2_profile.bump,
    )]
    pub player2_profile: Account<'info, PlayerProfile>,

    /// CHECK: SPL mint account - only validated for SPL token wagers
    pub mint: UncheckedAccount<'info>,
    /// CHECK: SPL escrow token account - only used for SPL token wagers
    #[account(mut)]
    pub escrow_token_account: UncheckedAccount<'info>,
    /// CHECK: Player 1 token account - only used for SPL token wagers
    #[account(mut)]
    pub player1_token_account: UncheckedAccount<'info>,
    /// CHECK: Player 2 token account - only used for SPL token wagers
    #[account(mut)]
    pub player2_token_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    /// CHECK: Token program - passed for SPL wagers
    pub token_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CancelMatch<'info> {
    #[account(mut, close = player1)]
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub player1: Signer<'info>,

    /// CHECK: SPL mint account - only validated for SPL token wagers
    pub mint: UncheckedAccount<'info>,
    /// CHECK: SPL escrow token account - only used for SPL token wagers
    #[account(mut)]
    pub escrow_token_account: UncheckedAccount<'info>,
    /// CHECK: Player 1 token account - only used for SPL token wagers
    #[account(mut)]
    pub player1_token_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    /// CHECK: Token program - passed for SPL wagers
    pub token_program: UncheckedAccount<'info>,
}

// MagicBlock Ephemeral Rollup delegation context
#[derive(Accounts)]
pub struct DelegateMatch<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub match_account: Account<'info, MatchAccount>,
    /// CHECK: This program's own ID, validated by delegation SDK
    pub owner_program: AccountInfo<'info>,
    /// CHECK: Delegation buffer PDA, derived from delegated account
    #[account(mut)]
    pub buffer: AccountInfo<'info>,
    /// CHECK: Delegation record PDA, derived from delegated account
    #[account(mut)]
    pub delegation_record: AccountInfo<'info>,
    /// CHECK: Delegation metadata PDA, derived from delegated account
    #[account(mut)]
    pub delegation_metadata: AccountInfo<'info>,
    /// CHECK: MagicBlock delegation program
    pub delegation_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

// MagicBlock Ephemeral Rollup undelegation context
#[derive(Accounts)]
pub struct UndelegateMatch<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub match_account: Account<'info, MatchAccount>,
    /// CHECK: This program's own ID
    pub owner_program: AccountInfo<'info>,
    /// CHECK: Delegation buffer PDA
    #[account(mut)]
    pub buffer: AccountInfo<'info>,
    /// CHECK: Delegation record PDA
    #[account(mut)]
    pub delegation_record: AccountInfo<'info>,
    /// CHECK: Delegation metadata PDA
    #[account(mut)]
    pub delegation_metadata: AccountInfo<'info>,
    /// CHECK: MagicBlock delegation program
    pub delegation_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
