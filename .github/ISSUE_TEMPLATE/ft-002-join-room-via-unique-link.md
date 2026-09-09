---
name: "FT-002: Join Room via Unique Link"
about: "Allow participants to join a planning room using a unique link."
title: "FT-002: Join Room via Unique Link"
labels: ["feature"]
assignees: []
---

## User Story
As a team member, I want to join a room via link so I can participate in estimation.

## Summary
Enable users to join an existing room from a room URL.

## Subtasks
- [ ] Implement join flow from URL
- [ ] Validate room ID and not-found behavior
- [ ] Add participant creation on join
- [ ] Add loading and error states
- [ ] Support concurrent joins

## Acceptance Criteria
- [ ] Valid links allow joining
- [ ] Invalid links show not-found/error
- [ ] Joined users appear in participant list
- [ ] Multiple users can join same room

## Notes
- Dependencies: Room service/state
- Risks/assumptions: concurrent updates

