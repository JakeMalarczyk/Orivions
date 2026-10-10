//! Orivions Escrow - canonical core (Rust).
//!
//! ⚠️ VERIFICATION PROTOCOL: this crate was written in an environment WITHOUT
//! a Rust toolchain (installation blocked). Per the project's post-audit rule,
//! that makes `cargo test` ON YOUR MACHINE the gate: nothing gets wired into
//! the product before this suite runs green. The TypeScript core (../core)
//! remains the active, executed-and-tested implementation until then.
//!
//! Design:
//! - Zero dependencies → `cargo test` needs no network.
//! - Transition tables as exhaustive `match` - the compiler proves every
//!   (state, state) pair is considered, something the TS version cannot.
//! - Money as integer cents (i64) - the same representation an on-chain
//!   program will use (base units), making this crate the seed of V3/Anchor.
//! - Mirrors ../core/stateMachine.ts and ../core/fees.ts exactly; the parity
//!   test (tests/parity.rs) mechanically diffs this crate against the SQL
//!   triggers, same as the TS suite does.

pub mod fees;
pub mod state_machine;

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum DealState {
    Draft,
    Proposed,
    Active,
    Completed,
    Cancelled,
    Disputed,
}

pub const ALL_DEAL_STATES: [DealState; 6] = [
    DealState::Draft,
    DealState::Proposed,
    DealState::Active,
    DealState::Completed,
    DealState::Cancelled,
    DealState::Disputed,
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum MilestoneState {
    Pending,
    Delivered,
    Approved,
    Rejected,
}

pub const ALL_MILESTONE_STATES: [MilestoneState; 4] = [
    MilestoneState::Pending,
    MilestoneState::Delivered,
    MilestoneState::Approved,
    MilestoneState::Rejected,
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Actor {
    Provider,
    Client,
    Admin,
}

pub const ALL_ACTORS: [Actor; 3] = [Actor::Provider, Actor::Client, Actor::Admin];

/// Fee rate is a closed set - invalid rates are unrepresentable (stronger than TS).
/// V1 is a single flat rate: 10% on every closed deal. No tiers, no subscriptions.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FeeRate {
    /// 10% - the flat success fee charged on every deal.
    Standard,
}

impl FeeRate {
    /// Numerator over a denominator of 100 (integer math only).
    pub fn percent(self) -> i64 {
        match self {
            FeeRate::Standard => 10,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EventType {
    DealCreated,
    DealProposed,
    DealAccepted,
    DealCompleted,
    DealCancelled,
    DealDisputed,
    DisputeResolved,
    MilestoneDelivered,
    MilestoneApproved,
    MilestoneRejected,
    MilestoneReopened,
}

/// Minimal milestone view the state machine needs (mirrors TS `Pick<Milestone,…>`).
#[derive(Debug, Clone, Copy)]
pub struct MilestoneView {
    /// 1-based position; approval is strictly in order.
    pub position: u32,
    pub state: MilestoneState,
}

/// SQL-facing names, used by the parity test and any (de)serialization.
pub fn deal_state_name(s: DealState) -> &'static str {
    match s {
        DealState::Draft => "draft",
        DealState::Proposed => "proposed",
        DealState::Active => "active",
        DealState::Completed => "completed",
        DealState::Cancelled => "cancelled",
        DealState::Disputed => "disputed",
    }
}

pub fn milestone_state_name(s: MilestoneState) -> &'static str {
    match s {
        MilestoneState::Pending => "pending",
        MilestoneState::Delivered => "delivered",
        MilestoneState::Approved => "approved",
        MilestoneState::Rejected => "rejected",
    }
}

pub fn actor_name(a: Actor) -> &'static str {
    match a {
        Actor::Provider => "provider",
        Actor::Client => "client",
        Actor::Admin => "admin",
    }
}
