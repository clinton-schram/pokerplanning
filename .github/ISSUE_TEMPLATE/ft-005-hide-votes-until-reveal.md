---
name: "FT-005: Hide Votes Until Reveal"
about: "Keep participant votes hidden until facilitator reveals all."
title: "FT-005: Hide Votes Until Reveal"
labels: ["feature"]
assignees: []
---

## User Story
As a facilitator, I want votes hidden until reveal so estimates stay unbiased.

## Summary
Keep votes hidden and reveal all simultaneously.

## Subtasks
- [ ] Add hidden/revealed room state
- [ ] Show placeholder for hidden votes
- [ ] Implement reveal-all action
- [ ] Disable reveal when no votes exist
- [ ] Sync reveal state across participants

## Acceptance Criteria
- [ ] Votes are hidden before reveal
- [ ] Reveal action shows all submitted votes
- [ ] Reveal button disabled when no votes submitted
- [ ] Revealed state persists until reset

## Notes
- Dependencies: Vote state model
- Risks/assumptions: real-time state propagation

