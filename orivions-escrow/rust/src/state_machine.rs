//! State machine - mirrors ../../core/stateMachine.ts and the SQL triggers.
//! Keep all three in sync; tests/parity.rs enforces Rust↔SQL mechanically.

use crate::{Actor, DealState, EventType, MilestoneState, MilestoneView};

pub type Verdict = Result<(), String>;

/// The deal transition table. Exhaustive over (from, to); compiler-checked.
pub fn deal_allowed_actors(from: DealState, to: DealState) -> &'static [Actor] {
    use Actor::*;
    use DealState::*;
    match (from, to) {
        (Draft, Proposed) => &[Provider],
        (Draft, Cancelled) => &[Provider],
        (Proposed, Active) => &[Client],
        (Proposed, Cancelled) => &[Provider, Client],
        (Active, Completed) => &[Admin],
        (Active, Cancelled) => &[Admin],
        (Active, Disputed) => &[Provider, Client],
        (Disputed, Active) => &[Admin],
        (Disputed, Cancelled) => &[Admin],
        (Disputed, Completed) => &[Admin],
        _ => &[],
    }
}

/// The milestone transition table. Exhaustive over (from, to).
pub fn milestone_allowed_actors(from: MilestoneState, to: MilestoneState) -> &'static [Actor] {
    use Actor::*;
    use MilestoneState::*;
    match (from, to) {
        (Pending, Delivered) => &[Provider],
        (Delivered, Approved) => &[Client],
        (Delivered, Rejected) => &[Client],
        (Rejected, Pending) => &[Provider],
        _ => &[],
    }
}

pub fn can_transition_deal(
    deal_state: DealState,
    to: DealState,
    actor: Actor,
    milestones: &[MilestoneView],
) -> Verdict {
    let allowed = deal_allowed_actors(deal_state, to);
    if allowed.is_empty() {
        return Err(format!(
            "Illegal transition: {} -> {}",
            crate::deal_state_name(deal_state),
            crate::deal_state_name(to)
        ));
    }
    if !allowed.contains(&actor) {
        return Err(format!(
            "Actor '{}' cannot perform {} -> {}",
            crate::actor_name(actor),
            crate::deal_state_name(deal_state),
            crate::deal_state_name(to)
        ));
    }

    // Structural guards beyond the table (identical to TS):
    if to == DealState::Proposed && milestones.is_empty() {
        return Err("A deal needs at least one milestone before it can be proposed".to_string());
    }
    if to == DealState::Completed && deal_state == DealState::Active {
        let unapproved = milestones
            .iter()
            .filter(|m| m.state != MilestoneState::Approved)
            .count();
        if unapproved > 0 {
            return Err(format!(
                "Cannot complete: {} milestone(s) not yet approved",
                unapproved
            ));
        }
    }
    Ok(())
}

pub fn can_transition_milestone(
    deal_state: DealState,
    milestone: MilestoneView,
    to: MilestoneState,
    actor: Actor,
    all_milestones: &[MilestoneView],
) -> Verdict {
    if deal_state != DealState::Active {
        return Err(format!(
            "Milestones can change only in an active deal (deal is '{}')",
            crate::deal_state_name(deal_state)
        ));
    }

    let allowed = milestone_allowed_actors(milestone.state, to);
    if allowed.is_empty() {
        return Err(format!(
            "Illegal transition: {} -> {}",
            crate::milestone_state_name(milestone.state),
            crate::milestone_state_name(to)
        ));
    }
    if !allowed.contains(&actor) {
        return Err(format!(
            "Actor '{}' cannot perform {} -> {}",
            crate::actor_name(actor),
            crate::milestone_state_name(milestone.state),
            crate::milestone_state_name(to)
        ));
    }

    // Strict approval ordering; delivery may be parallel (identical to TS).
    if to == MilestoneState::Approved {
        let earlier_unapproved: Vec<u32> = all_milestones
            .iter()
            .filter(|m| m.position < milestone.position && m.state != MilestoneState::Approved)
            .map(|m| m.position)
            .collect();
        if !earlier_unapproved.is_empty() {
            return Err(format!(
                "Milestone #{} cannot be approved before earlier milestone(s): {:?}",
                milestone.position, earlier_unapproved
            ));
        }
    }
    Ok(())
}

/// Every successful transition maps to exactly one event (mirrors TS).
pub fn deal_event_for(from: DealState, to: DealState) -> Option<EventType> {
    use DealState::*;
    match (from, to) {
        (_, Proposed) => Some(EventType::DealProposed),
        (Proposed, Active) => Some(EventType::DealAccepted),
        (Disputed, Active) => Some(EventType::DisputeResolved),
        (Disputed, Completed) => Some(EventType::DisputeResolved),
        (_, Completed) => Some(EventType::DealCompleted),
        (Disputed, Cancelled) => Some(EventType::DisputeResolved),
        (_, Cancelled) => Some(EventType::DealCancelled),
        (_, Disputed) => Some(EventType::DealDisputed),
        _ => None,
    }
}

pub fn milestone_event_for(from: MilestoneState, to: MilestoneState) -> Option<EventType> {
    use MilestoneState::*;
    match (from, to) {
        (_, Delivered) => Some(EventType::MilestoneDelivered),
        (_, Approved) => Some(EventType::MilestoneApproved),
        (_, Rejected) => Some(EventType::MilestoneRejected),
        (Rejected, Pending) => Some(EventType::MilestoneReopened),
        _ => None,
    }
}
