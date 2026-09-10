---
name: "FT-007: Remove Person from Room"
about: "Allow facilitators to remove a person from a room after confirming the action."
title: "FT-007: Remove Person from Room"
labels: ["feature"]
assignees: []
---

## User Story
As a facilitator, I want to remove a person from a room so I can keep the participant list accurate.

## Summary
Add a room participant removal flow that requires an are-you-sure confirmation modal before the person is removed.

## Subtasks
- [ ] Add remove-person control to the participant list
- [ ] Show an are-you-sure confirmation modal before removal
- [ ] Remove the selected person from room state after confirmation
- [ ] Preserve the participant list when the modal is cancelled
- [ ] Handle removing a person who has already voted

## Acceptance Criteria
- [ ] Facilitator can start removing a person from the room
- [ ] An are-you-sure confirmation modal is shown before removal
- [ ] Cancelling the modal leaves the participant in the room
- [ ] Confirming the modal removes the participant from the room
- [ ] The room state updates correctly after the participant is removed

## Notes
- Dependencies: Room participant state + participant list UI
- Risks/assumptions: remove permissions and concurrent room updates
