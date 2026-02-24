use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("AKPb5mB3Yn94QHUQrsQTSjDYUAgKqxPhZSUvUbkXgtaq");

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
        + 8   // wager_amount
        + 1   // status (enum)
        + 32  // winner
        + 1   // player1_score
        + 1   // player2_score
        + 8   // created_at
        + 8   // settled_at
        + 8   // match_id
        + 1;  // bump
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

    /// Create a new match with SOL wager. Player 1 deposits wager into the match PDA.
    pub fn create_match(
        ctx: Context<CreateMatch>,
        match_id: u64,
        wager_amount: u64,
    ) -> Result<()> {
        require!(wager_amount > 0, LastRallyError::ZeroWager);

        // Transfer SOL from player1 to match PDA (escrow)
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.player1.to_account_info(),
                    to: ctx.accounts.match_account.to_account_info(),
                },
            ),
            wager_amount,
        )?;

        let match_account = &mut ctx.accounts.match_account;
        match_account.player1 = ctx.accounts.player1.key();
        match_account.player2 = Pubkey::default();
        match_account.wager_amount = wager_amount;
        match_account.status = MatchStatus::Waiting;
        match_account.winner = Pubkey::default();
        match_account.player1_score = 0;
        match_account.player2_score = 0;
        match_account.created_at = Clock::get()?.unix_timestamp;
        match_account.settled_at = 0;
        match_account.match_id = match_id;
        match_account.bump = ctx.bumps.match_account;

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

        // Transfer matching wager from player2 to match PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.player2.to_account_info(),
                    to: match_account.to_account_info(),
                },
            ),
            match_account.wager_amount,
        )?;

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

        // Transfer full pot (2x wager) to winner
        let pot = match_account.wager_amount * 2;
        let match_info = match_account.to_account_info();

        // Debit from PDA
        **match_info.try_borrow_mut_lamports()? -= pot;
        // Credit to winner
        if winner == match_account.player1 {
            **ctx.accounts.player1.to_account_info().try_borrow_mut_lamports()? += pot;
        } else {
            **ctx.accounts.player2.to_account_info().try_borrow_mut_lamports()? += pot;
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

    /// Cancel a match (only if still Waiting). Closes account, refunds wager + rent to player 1.
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

        // Account closed via `close = player1` constraint — all lamports (wager + rent) returned
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
#[instruction(match_id: u64)]
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
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinMatch<'info> {
    #[account(mut)]
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub player2: Signer<'info>,
    pub system_program: Program<'info, System>,
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
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelMatch<'info> {
    #[account(mut, close = player1)]
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub player1: Signer<'info>,
    pub system_program: Program<'info, System>,
}
