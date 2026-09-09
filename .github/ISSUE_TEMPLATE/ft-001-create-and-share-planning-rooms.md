---
name: "FT-001: Create and Share Planning Rooms"
about: "Create unique planning rooms and share room links."
title: "FT-001: Create and Share Planning Rooms"
labels: ["feature"]
assignees: []
---

## User Story
As a facilitator, I want to create a room and share a unique link so my team can join.

## Summary
Implement room creation with unique IDs and shareable links.

## Subtasks
- [ ] Implement room ID/code generation
- [ ] Add Create Room action and route
- [ ] Display room ID and shareable URL
- [ ] Add copy-link control
- [ ] Handle invalid/nonexistent room states

## Acceptance Criteria
- [ ] User can create a room
- [ ] Room has a unique link
- [ ] Link is copyable from UI
- [ ] Invalid room access shows clear error

## Notes
- Dependencies: Routing + room state
- Risks/assumptions: ID uniqueness strategy
