---
name: "FT-006: Reset Voting Round"
about: "Reset votes and return the room to hidden state for the next story."
title: "FT-006: Reset Voting Round"
labels: ["feature"]
assignees: []
---

## User Story
As a facilitator, I want to reset the round so the team can estimate the next item.

## Summary
Clear all votes and return room to hidden state without removing participants.

## Subtasks
- [ ] Clear participant vote selections
- [ ] Reset reveal state to hidden
- [ ] Preserve participant list
- [ ] Add reset action safety behavior
- [ ] Validate immediate next-round voting

## Acceptance Criteria
- [ ] Reset clears all current votes
- [ ] Votes become hidden after reset
- [ ] Participants remain in room
- [ ] Team can start voting again immediately

## Notes
- Dependencies: Reveal/vote state
- Risks/assumptions: race conditions during reset
