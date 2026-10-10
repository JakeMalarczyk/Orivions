//! Exhaustive matrix + guard + event-mapping + SQL-parity tests.
//! Mirrors ../tests/*.test.mjs (TS) - same coverage, same expectations.

use escrow_core::state_machine::*;
use escrow_core::*;

fn ms(state: MilestoneState, position: u32) -> MilestoneView {
    MilestoneView { position, state }
}

fn approved_all() -> Vec<MilestoneView> {
    vec![ms(MilestoneState::Approved, 1), ms(MilestoneState::Approved, 2)]
}

// ---------------------------------------------------------------------------
// 1. Exhaustive deal matrix: 6 × 6 × 3 = 108 combinations vs the table
// ---------------------------------------------------------------------------
#[test]
fn deal_matrix_exhaustive() {
    for &from in ALL_DEAL_STATES.iter() {
        for &to in ALL_DEAL_STATES.iter() {
            for &actor in ALL_ACTORS.iter() {
                let table_allows = deal_allowed_actors(from, to).contains(&actor);
                let verdict = can_transition_deal(from, to, actor, &approved_all());
                assert_eq!(
                    verdict.is_ok(),
                    table_allows,
                    "deal {:?}->{:?} as {:?}: expected {}, got {:?}",
                    from, to, actor, table_allows, verdict
                );
            }
        }
    }
}

// ---------------------------------------------------------------------------
// 2. Deal structural guards
// ---------------------------------------------------------------------------
#[test]
fn deal_guards() {
    // proposing with zero milestones denied despite table allowing the move
    assert!(can_transition_deal(DealState::Draft, DealState::Proposed, Actor::Provider, &[]).is_err());
    // completing with an unapproved milestone denied
    let mixed = vec![ms(MilestoneState::Approved, 1), ms(MilestoneState::Delivered, 2)];
    assert!(can_transition_deal(DealState::Active, DealState::Completed, Actor::Admin, &mixed).is_err());
    // dispute resolution may complete regardless of milestone states
    let delivered = vec![ms(MilestoneState::Delivered, 1)];
    assert!(can_transition_deal(DealState::Disputed, DealState::Completed, Actor::Admin, &delivered).is_ok());
}

// ---------------------------------------------------------------------------
// 3. Exhaustive milestone matrix in an active deal: 4 × 4 × 3 = 48
// ---------------------------------------------------------------------------
#[test]
fn milestone_matrix_exhaustive() {
    for &from in ALL_MILESTONE_STATES.iter() {
        for &to in ALL_MILESTONE_STATES.iter() {
            for &actor in ALL_ACTORS.iter() {
                let table_allows = milestone_allowed_actors(from, to).contains(&actor);
                let all = vec![ms(from, 1)];
                let verdict = can_transition_milestone(DealState::Active, ms(from, 1), to, actor, &all);
                assert_eq!(
                    verdict.is_ok(),
                    table_allows,
                    "milestone {:?}->{:?} as {:?}: expected {}, got {:?}",
                    from, to, actor, table_allows, verdict
                );
            }
        }
    }
}

// ---------------------------------------------------------------------------
// 4. Milestone guards
// ---------------------------------------------------------------------------
#[test]
fn milestone_guards() {
    // frozen outside an active deal - every non-active deal state
    for &deal_state in ALL_DEAL_STATES.iter().filter(|&&s| s != DealState::Active) {
        let all = vec![ms(MilestoneState::Pending, 1)];
        assert!(
            can_transition_milestone(deal_state, ms(MilestoneState::Pending, 1), MilestoneState::Delivered, Actor::Provider, &all).is_err(),
            "milestone should be frozen when deal is {:?}",
            deal_state
        );
    }
    // out-of-order approval denied
    let both_delivered = vec![ms(MilestoneState::Delivered, 1), ms(MilestoneState::Delivered, 2)];
    assert!(can_transition_milestone(DealState::Active, both_delivered[1], MilestoneState::Approved, Actor::Client, &both_delivered).is_err());
    // out-of-order DELIVERY allowed (parallel work)
    let both_pending = vec![ms(MilestoneState::Pending, 1), ms(MilestoneState::Pending, 2)];
    assert!(can_transition_milestone(DealState::Active, both_pending[1], MilestoneState::Delivered, Actor::Provider, &both_pending).is_ok());
    // in-order approval allowed
    let in_order = vec![ms(MilestoneState::Approved, 1), ms(MilestoneState::Delivered, 2)];
    assert!(can_transition_milestone(DealState::Active, in_order[1], MilestoneState::Approved, Actor::Client, &in_order).is_ok());
}

// ---------------------------------------------------------------------------
// 5. Event mapping: every legal transition maps to Some(event)
// ---------------------------------------------------------------------------
#[test]
fn event_mapping_total_over_legal_transitions() {
    for &from in ALL_DEAL_STATES.iter() {
        for &to in ALL_DEAL_STATES.iter() {
            if !deal_allowed_actors(from, to).is_empty() {
                assert!(deal_event_for(from, to).is_some(), "no event for deal {:?}->{:?}", from, to);
            }
        }
    }
    for &from in ALL_MILESTONE_STATES.iter() {
        for &to in ALL_MILESTONE_STATES.iter() {
            if !milestone_allowed_actors(from, to).is_empty() {
                assert!(milestone_event_for(from, to).is_some(), "no event for milestone {:?}->{:?}", from, to);
            }
        }
    }
    // meaning-carrying specifics
    assert_eq!(deal_event_for(DealState::Proposed, DealState::Active), Some(EventType::DealAccepted));
    assert_eq!(deal_event_for(DealState::Disputed, DealState::Active), Some(EventType::DisputeResolved));
    assert_eq!(milestone_event_for(MilestoneState::Rejected, MilestoneState::Pending), Some(EventType::MilestoneReopened));
}

// ---------------------------------------------------------------------------
// 6. SQL parity - hand-rolled parser (algorithm pre-verified against the real
//    file in Python before transcription; no regex, no dependencies).
// ---------------------------------------------------------------------------
const SQL: &str = include_str!("../../sql/001_escrow.sql");

fn between<'a>(line: &'a str, prefix: &str) -> Option<&'a str> {
    let start = line.find(prefix)? + prefix.len();
    let rest = &line[start..];
    let end = rest.find('\'')?;
    Some(&rest[..end])
}

fn list_after(line: &str, prefix: &str) -> Option<Vec<String>> {
    let start = line.find(prefix)? + prefix.len();
    let rest = &line[start..];
    let end = rest.find(')')?;
    Some(
        rest[..end]
            .split(',')
            .map(|p| p.trim().trim_matches('\'').to_string())
            .collect(),
    )
}

fn extract_tuples(block: &str) -> std::collections::BTreeSet<String> {
    let mut out = std::collections::BTreeSet::new();
    for raw in block.lines() {
        let line = raw.trim();
        let from = match between(line, "old.state = '") {
            Some(f) => f.to_string(),
            None => continue,
        };
        let tos: Vec<String> = if let Some(t) = between(line, "new.state = '") {
            vec![t.to_string()]
        } else if let Some(ts) = list_after(line, "new.state in (") {
            ts
        } else {
            continue;
        };
        let actors: Vec<String> = if let Some(a) = between(line, "actor = '") {
            vec![a.to_string()]
        } else if let Some(aa) = list_after(line, "actor in (") {
            aa
        } else {
            continue;
        };
        for t in &tos {
            for a in &actors {
                out.insert(format!("{}->{}:{}", from, t, a));
            }
        }
    }
    out
}

fn rust_deal_tuples() -> std::collections::BTreeSet<String> {
    let mut out = std::collections::BTreeSet::new();
    for &from in ALL_DEAL_STATES.iter() {
        for &to in ALL_DEAL_STATES.iter() {
            for &actor in deal_allowed_actors(from, to) {
                out.insert(format!(
                    "{}->{}:{}",
                    deal_state_name(from),
                    deal_state_name(to),
                    actor_name(actor)
                ));
            }
        }
    }
    out
}

fn rust_milestone_tuples() -> std::collections::BTreeSet<String> {
    let mut out = std::collections::BTreeSet::new();
    for &from in ALL_MILESTONE_STATES.iter() {
        for &to in ALL_MILESTONE_STATES.iter() {
            for &actor in milestone_allowed_actors(from, to) {
                out.insert(format!(
                    "{}->{}:{}",
                    milestone_state_name(from),
                    milestone_state_name(to),
                    actor_name(actor)
                ));
            }
        }
    }
    out
}

#[test]
fn sql_parity() {
    let deal_fn = SQL
        .find("create or replace function public.escrow_guard_deal_transition")
        .expect("deal trigger fn not found in SQL");
    let ms_fn = SQL
        .find("create or replace function public.escrow_guard_milestone_transition")
        .expect("milestone trigger fn not found in SQL");

    let sql_deal = extract_tuples(&SQL[deal_fn..ms_fn]);
    let sql_ms = extract_tuples(&SQL[ms_fn..]);

    assert!(!sql_deal.is_empty(), "parser sanity: no deal tuples parsed");
    assert!(!sql_ms.is_empty(), "parser sanity: no milestone tuples parsed");
    assert_eq!(rust_deal_tuples(), sql_deal, "deal tables differ between Rust and SQL");
    assert_eq!(rust_milestone_tuples(), sql_ms, "milestone tables differ between Rust and SQL");
}
