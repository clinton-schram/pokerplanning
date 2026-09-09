---
name: "FT-003: Persist User Name in Browser"
about: "Persist and auto-fill participant name using browser storage."
title: "FT-003: Persist User Name in Browser"
labels: ["feature"]
assignees: []
---

## User Story
As a returning user, I want my name remembered so I can join faster.

## Summary
Persist and auto-fill user name with localStorage.

## Subtasks
- [ ] Add localStorage key for username
- [ ] Auto-fill name prompt from cache
- [ ] Save name on submit
- [ ] Handle missing/cleared cache
- [ ] Allow user to change saved name

## Acceptance Criteria
- [ ] First-time user is prompted for name
- [ ] Returning user sees auto-filled name
- [ ] Updated name overwrites prior cached value
- [ ] App works when localStorage is empty

## Notes
- Dependencies: Join flow UI
- Risks/assumptions: browser storage availability

