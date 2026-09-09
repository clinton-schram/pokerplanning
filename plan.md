# Poker Planning App Plan

## Goal
Create a Scrum Poker / Poker Planning web app inspired by the referenced site, where:
- team members can add themselves,
- each member can select a card from the Fibonacci sequence,
- selected scores remain hidden until reveal,
- a reset button clears the round.

## Core Features

### 1. Team Member Management
- Add a team member by name.
- Display all team members in a list or grid.
- Optionally allow removing a member.

### 2. Fibonacci Card Selection
Use a Fibonacci-style planning deck such as:
- 0
- 1
- 2
- 3
- 5
- 8
- 13
- 21
- 34
- 55
- 89
- ?
- Coffee break / optional abstain card

### 3. Hidden Scores Until Reveal
- Before reveal, each participant’s chosen card should be hidden.
- Show a generic placeholder such as:
  - “Hidden”
  - a card back
  - a question mark
- On reveal, show each person’s selected value.

### 4. Reveal Button
- Reveal all selected cards at once.
- Keep revealed state until reset.

### 5. Reset Button
- Clear all selected cards.
- Hide all scores again.
- Optionally clear the reveal state.
- Keep team members unless you want a full round reset.

## Suggested UI Layout

### Header
- App title
- Short subtitle like “Team estimation made simple”

### Left Panel or Top Section
- Add team member form
- Current participant list

### Main Board
- Card deck for Fibonacci values
- Each member can select one card
- Selected card shown as active state

### Controls
- Reveal button
- Reset button

### Results Section
- When hidden:
  - show placeholders
- When revealed:
  - show each member’s selected score
- Optionally show average / consensus if useful

## State Model
Suggested state:
- `teamMembers: Array<{ id, name, selectedCard }>`
- `isRevealed: boolean`
- `availableCards: string[]`

## Behavior Rules
- A member can only have one selected card at a time.
- Clicking a card updates that member’s selection.
- Reveal toggles hidden cards into visible scores.
- Reset clears all selections and sets reveal to false.

## Nice-to-Have Enhancements
- Edit member names
- Remove member
- Voting history by round
- Consensus/average calculation
- Keyboard accessibility
- Mobile responsive layout
- Animations for reveal/reset

## Implementation Steps

### Step 1: Inspect the existing repo
- Identify framework and entry point.
- Determine whether the app already exists or the repo is empty.

### Step 2: Build the main UI
- Create layout for members, deck, and controls.
- Style it to resemble a modern planning board.

### Step 3: Add state management
- Store team members and selected cards.
- Track reveal/reset state.

### Step 4: Wire up actions
- Add member
- Select card
- Reveal votes
- Reset round

### Step 5: Add polish
- Responsive design
- Disabled states
- Active selection states
- Hidden/revealed transitions

### Step 6: Test the flow
- Add member
- Select a card
- Confirm hidden display
- Reveal results
- Reset and confirm clear state

## Acceptance Criteria
- Users can add themselves to the board.
- Users can choose from Fibonacci cards.
- Scores are hidden until Reveal is clicked.
- Reset clears the round.
- UI is responsive and usable.

## Optional Future Work
- Real-time multiplayer sync
- Login/authentication
- Persistent sessions
- Export round results
- Story/task labels
