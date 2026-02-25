use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

declare_id!("BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG");

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

    // SPL token accounts (only used for SPL tokens, must exist)
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub player1_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct JoinMatch<'info> {
    #[account(mut)]
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub player2: Signer<'info>,

    // SPL token accounts (only used for SPL tokens, must exist)
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub player2_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
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

    // SPL token accounts (only used for SPL tokens)
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub player1_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub player2_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelMatch<'info> {
    #[account(mut, close = player1)]
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub player1: Signer<'info>,

    // SPL token accounts (only used for SPL tokens)
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub player1_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
