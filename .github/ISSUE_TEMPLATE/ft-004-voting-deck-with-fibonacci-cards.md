---
name: "FT-004: Voting Deck with Fibonacci Cards"
about: "Provide a Fibonacci-style deck and single active vote selection."
title: "FT-004: Voting Deck with Fibonacci Cards"
labels: ["feature"]
assignees: []
---

## User Story
As a participant, I want to pick a Fibonacci card so I can submit an estimate.

## Summary
Add selectable planning deck and per-user vote state.

## Subtasks
- [ ] Define card set: 0,1,2,3,5,8,13,21,34,55,89,?,☕
- [ ] Render selectable deck UI
- [ ] Store one active vote per participant
- [ ] Show selected state for current user
- [ ] Block voting before identity is set

## Acceptance Criteria
- [ ] User can select exactly one card at a time
- [ ] Selecting a new card replaces prior selection
- [ ] Selected state is visible to voter
- [ ] Vote is stored in room state

## Notes
- Dependencies: Participant identity
- Risks/assumptions: vote update synchronization

