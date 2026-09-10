# Poker Planning App Plan

## Goal
Create a Scrum Poker / Poker Planning web app inspired by the referenced site, where:
- team members can create unique rooms and share links,
- users can join rooms using unique links,
- each member can select a card from the Fibonacci sequence,
- selected scores remain hidden until reveal,
- a reset button clears the round.

## Core Features

### 1. Room Management
- **Create Room**: Users can create a new planning room with a unique identifier.
  - Each room is assigned a unique URL/link that can be shared with team members.
  - The room creator becomes the first participant.
  - Room should have a unique code or ID (e.g., alphanumeric string like "ABC123DEF").
  
- **Join Room**: Users can enter a room using the unique link.
  - Link format: `https://app.com/room/{unique-room-id}`
  - Users joining a room are added to the participant list immediately.
  - Multiple users can join the same room simultaneously.

- **Name Persistence**: When a user enters a room:
  - Check if the user's name is stored in browser cache (localStorage).
  - If name exists in cache, automatically populate it and skip the name prompt.
  - If no cached name exists, prompt the user to enter their name.
  - Store the entered name in localStorage for future room sessions.
  - Display the user's name on the board once they enter.

- **Room State**: 
  - Rooms maintain state including all participants, their votes, and reveal status.
  - Room persists until explicitly closed or expires (if implementing timeout).
  - Multiple independent rooms can exist simultaneously.

### 2. Team Member Management
- Add a team member by name (automatic on room join).
- Display all team members in a list or grid.
- Show which members have voted and which are pending.
- Allow removing a member from the room.
- Require a confirmation modal before removing a member from the room.
- Track member identity for the current session.

### 3. Fibonacci Card Selection
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

### 4. Hidden Scores Until Reveal
- Before reveal, each participant's chosen card should be hidden.
- Show a generic placeholder such as:
  - "Hidden"
  - a card back
  - a question mark
- On reveal, show each person's selected value.

### 5. Reveal Button
- Reveal all selected cards at once.
- Keep revealed state until reset.
- Only allow reveal if at least one member has voted.

### 6. Reset Button
- Clear all selected cards.
- Hide all scores again.
- Optionally clear the reveal state.
- Keep team members in the room.

## Suggested UI Layout

### Header
- App title
- Room ID or code display (when in a room)
- Copy link button to share room

### Pre-Room Screen
- "Create Room" button
- "Join Room" input field with example link

### Name Entry Modal
- Prompt: "What is your name?"
- Input field pre-filled if name exists in cache
- Submit button to confirm and enter room

### Left Panel or Top Section
- Current room participant list with names
- Status indicators (voted / pending)
- Member count display
- Remove member action with confirmation modal

### Main Board
- Card deck for Fibonacci values
- Each member's section showing:
  - Member name
  - Selected card (if voted)
  - Hidden placeholder (if not revealed)
- Indicate which members have voted

### Controls
- Reveal button
- Reset button

### Results Section
- When hidden:
  - show placeholders with participant names
- When revealed:
  - show each member's selected score
- Optionally show average / consensus if useful
- Display voting statistics

## State Model
Suggested state:
- `roomId: string` (unique identifier for the room)
- `currentUser: { name: string }` (cached user information)
- `teamMembers: Array<{ id, name, selectedCard, hasVoted }>`
- `isRevealed: boolean`
- `availableCards: string[]`
- `localStorageCache: { userName: string }` (persisted in browser)

## Storage Model

### Browser Cache (localStorage)
- Key: `pokerplanning_user_name`
- Value: User's name (string)
- Scope: Per browser, persists across sessions
- Used to auto-populate name when entering a room

### Room State Storage
Consider storage options for room persistence:
- **Session-based**: Room data stored in memory (clears on server restart)
- **Database**: Persistent storage for rooms and voting history
- **Cloud Storage**: Option for real-time sync across devices

## Behavior Rules
- A member can only have one selected card at a time.
- Clicking a card updates that member's selection.
- Reveal toggles hidden cards into visible scores.
- Reset clears all selections and sets reveal to false.
- Only authenticated room participants can vote.
- Name must be entered before voting.
- Removing a member requires explicit confirmation before they are removed from the room.

## Nice-to-Have Enhancements
- Edit member names
- Remove member
- Voting history by round
- Consensus/average calculation
- Keyboard accessibility
- Mobile responsive layout
- Animations for reveal/reset
- Copy room link to clipboard functionality
- Room timer for each voting round
- WebSocket support for real-time multi-user sync
- Notification when users join/leave
- Password protection for rooms (optional)
- QR code generation for room links

## Implementation Steps

### Step 1: Inspect the existing repo
- Identify framework and entry point.
- Determine whether the app already exists or the repo is empty.

### Step 2: Build Room Infrastructure
- Create unique room ID generation system (UUID or short alphanumeric code).
- Build create room page/modal.
- Build join room page/modal with URL input.
- Set up room state management structure.

### Step 3: Implement Browser Cache
- Set up localStorage access for user name.
- Create logic to check cache on room entry.
- Auto-populate name input if cached.
- Store name to cache when user enters room.

### Step 4: Build Name Entry Flow
- Create modal/form for name entry.
- Check cache first before showing prompt.
- Allow users to edit name if desired.
- Validate name is not empty before room entry.

### Step 5: Build the main UI
- Create layout for members, deck, and controls.
- Build room header with ID and share button.
- Create participant list display.
- Style it to resemble a modern planning board.

### Step 6: Add state management
- Store room ID and participant information.
- Store team members and selected cards per room.
- Track reveal/reset state per room.
- Manage user persistence across room sessions.

### Step 7: Wire up actions
- Create room
- Join room with link
- Add/load member (on join)
- Select card
- Reveal votes
- Reset round

### Step 8: Add polish
- Responsive design
- Disabled states
- Active selection states
- Hidden/revealed transitions
- Share link functionality
- Loading states for room entry

### Step 9: Test the flow
- Create a new room
- Copy and share room link
- Enter room with a new name (should be prompted)
- Enter same room again (name should be pre-filled)
- Add team members
- Remove a team member and confirm the removal modal flow
- Select cards
- Confirm hidden display
- Reveal results
- Reset and confirm clear state

## Acceptance Criteria
- Users can create a unique room and receive a shareable link.
- Users can join a room using the unique link.
- User name is cached in browser and auto-populated on subsequent room entries.
- User is prompted for name if not cached.
- Users can add themselves to the board.
- Facilitators can remove a person from the room only after confirming the action.
- Users can choose from Fibonacci cards.
- Scores are hidden until Reveal is clicked.
- Reset clears the round.
- UI is responsive and usable.
- Multiple independent rooms can operate simultaneously.

## Optional Future Work
- Real-time multiplayer sync via WebSocket
- Login/authentication system
- Persistent room storage in database
- Export round results
- Story/task labels
- Room expiration/cleanup
- Admin controls for room management
- Voting analytics and reports
- Integration with Jira or other project management tools
