import { useEffect, useMemo, useState } from 'preact/hooks'
import './app.css'
import {
  createRoom,
  fetchRoom,
  joinRoom,
  resetRoom,
  revealRoom,
  submitVote,
} from './lib/api'
import { getCachedUserName, saveCachedUserName } from './lib/nameCache'
import type { Room } from './lib/types'
import { AVAILABLE_CARDS } from './lib/types'

function parseRoomIdFromPath(pathname: string) {
  const match = pathname.match(/^\/room\/([A-Z0-9]+)$/)
  return match?.[1] ?? null
}

function extractRoomId(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return null

  const pathMatch = trimmed.match(/\/room\/([A-Z0-9]+)$/i)
  if (pathMatch) return pathMatch[1].toUpperCase()
  return trimmed.toUpperCase()
}

function getRoomLink(roomId: string) {
  return new URL(`/room/${roomId}`, window.location.origin).toString()
}

function copyTextFallback(value: string) {
  const input = document.createElement('input')
  input.value = value
  input.setAttribute('readonly', '')
  input.style.position = 'absolute'
  input.style.left = '-9999px'
  document.body.appendChild(input)
  input.select()
  input.setSelectionRange(0, value.length)
  const copied = document.execCommand?.('copy') ?? false
  document.body.removeChild(input)
  return copied
}

export function App() {
  const [roomId, setRoomId] = useState<string | null>(() =>
    parseRoomIdFromPath(window.location.pathname),
  )
  const [room, setRoom] = useState<Room | null>(null)
  const [joinInput, setJoinInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [hasJoinedRoomId, setHasJoinedRoomId] = useState<string | null>(null)
  const [userName, setUserName] = useState(() => getCachedUserName() ?? '')
  const [nameDraft, setNameDraft] = useState(() => getCachedUserName() ?? '')
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const requiresName = roomId !== null && !userName
  const hasVotes = room?.participants.some((participant) => participant.hasVoted) ?? false
  const roomLink = roomId ? getRoomLink(roomId) : null
  const shareLinkInputId = roomId ? `room-link-${roomId}` : 'room-link'
  const currentParticipant = useMemo(
    () => room?.participants.find((participant) => participant.id === participantId) ?? null,
    [room, participantId],
  )

  useEffect(() => {
    const onPopState = () => {
      setRoomId(parseRoomIdFromPath(window.location.pathname))
      setError(null)
      setRoom(null)
      setParticipantId(null)
      setHasJoinedRoomId(null)
      setCopyFeedback(null)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!roomId || !userName || hasJoinedRoomId === roomId) return

    joinRoom(roomId, userName)
      .then((response) => {
        setParticipantId(response.participantId)
        setRoom(response.room)
        setHasJoinedRoomId(roomId)
        setError(null)
      })
      .catch((joinError) => {
        setError(joinError instanceof Error ? joinError.message : 'Unable to join room.')
      })
  }, [hasJoinedRoomId, roomId, userName])

  useEffect(() => {
    if (!roomId) return

    let cancelled = false

    const load = async () => {
      try {
        const nextRoom = await fetchRoom(roomId)
        if (!cancelled) {
          setRoom(nextRoom)
          setError(null)
        }
      } catch (roomError) {
        if (!cancelled) {
          setError(roomError instanceof Error ? roomError.message : 'Unable to fetch room.')
        }
      }
    }

    void load()
    const timer = window.setInterval(() => void load(), 1500)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [roomId])

  const navigateToRoom = (nextRoomId: string) => {
    window.history.pushState({}, '', `/room/${nextRoomId}`)
    setRoomId(nextRoomId)
    setRoom(null)
    setParticipantId(null)
    setHasJoinedRoomId(null)
    setError(null)
    setCopyFeedback(null)
  }

  const onCreateRoom = async () => {
    const nextName = nameDraft.trim()
    if (!nextName) {
      setError('Please enter your name before creating a room.')
      return
    }

    setCreatingRoom(true)
    try {
      const created = await createRoom(nextName)
      navigateToRoom(created.room.id)
      saveCachedUserName(nextName)
      setUserName(nextName)
      setParticipantId(created.participantId)
      setRoom(created.room)
      setHasJoinedRoomId(created.room.id)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create room.')
    } finally {
      setCreatingRoom(false)
    }
  }

  const onJoinRoom = () => {
    const parsed = extractRoomId(joinInput)
    if (!parsed) {
      setError('Enter a room code or room link.')
      return
    }
    navigateToRoom(parsed)
  }

  const onConfirmName = () => {
    const nextName = nameDraft.trim()
    if (!nextName) {
      setError('Name is required.')
      return
    }
    saveCachedUserName(nextName)
    setUserName(nextName)
    setError(null)
  }

  const onVote = async (card: string) => {
    if (!roomId || !participantId) return
    try {
      const response = await submitVote(roomId, participantId, card)
      setRoom(response.room)
      setError(null)
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : 'Unable to submit vote.')
    }
  }

  const onReveal = async () => {
    if (!roomId) return
    try {
      const response = await revealRoom(roomId)
      setRoom(response.room)
      setError(null)
    } catch (revealError) {
      setError(revealError instanceof Error ? revealError.message : 'Unable to reveal votes.')
    }
  }

  const onReset = async () => {
    if (!roomId) return
    try {
      const response = await resetRoom(roomId)
      setRoom(response.room)
      setError(null)
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to reset round.')
    }
  }

  const copyRoomLink = async () => {
    if (!roomLink) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(roomLink)
        setCopyFeedback('Link copied.')
        return
      }
    } catch {
      // Fall through to the manual fallback.
    }

    if (copyTextFallback(roomLink)) {
      setCopyFeedback('Link copied.')
      return
    }

    setCopyFeedback('Copy the link below manually.')
  }

  if (!roomId) {
    return (
      <main class="container">
        <h1>Poker Planning</h1>
        <p>Create a room or join with a room link.</p>
        {error ? <p class="error">{error}</p> : null}
        <label>
          Your name
          <input
            value={nameDraft}
            onInput={(event) => setNameDraft((event.currentTarget as HTMLInputElement).value)}
            placeholder="Jane"
          />
        </label>
        <div class="actions">
          <button type="button" onClick={() => void onCreateRoom()} disabled={creatingRoom}>
            {creatingRoom ? 'Creating...' : 'Create Room'}
          </button>
        </div>
        <label>
          Join room code or URL
          <input
            value={joinInput}
            onInput={(event) => setJoinInput((event.currentTarget as HTMLInputElement).value)}
            placeholder="AB12CD34 or https://app.com/room/AB12CD34"
          />
        </label>
        <div class="actions">
          <button type="button" onClick={onJoinRoom}>
            Join Room
          </button>
        </div>
      </main>
    )
  }

  return (
    <main class="container">
      <header class="room-header">
        <h1>Poker Planning</h1>
        <div class="room-meta">
          <span>Room: {roomId}</span>
          <button type="button" onClick={() => void copyRoomLink()}>
            Copy Link
          </button>
        </div>
        {roomLink ? (
          <label class="room-link" htmlFor={shareLinkInputId}>
            <span>Share link</span>
            <input
              id={shareLinkInputId}
              type="text"
              readOnly
              value={roomLink}
              onFocus={(event) => event.currentTarget.select()}
            />
          </label>
        ) : null}
        {copyFeedback ? <p class="copy-feedback">{copyFeedback}</p> : null}
      </header>

      {requiresName ? (
        <section class="card">
          <h2>What is your name?</h2>
          <label>
            Name
            <input
              value={nameDraft}
              onInput={(event) => setNameDraft((event.currentTarget as HTMLInputElement).value)}
              placeholder="Jane"
            />
          </label>
          <button type="button" onClick={onConfirmName}>
            Enter Room
          </button>
        </section>
      ) : null}

      {error ? <p class="error">{error}</p> : null}

      {room ? (
        <>
          <section class="card">
            <h2>Team members ({room.participants.length})</h2>
            <ul class="participants">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>{participant.name}</span>
                  <span>{participant.hasVoted ? 'Voted' : 'Pending'}</span>
                </li>
              ))}
            </ul>
          </section>

          <section class="card">
            <h2>Select your card</h2>
            <div class="cards">
              {AVAILABLE_CARDS.map((card) => (
                <button
                  key={card}
                  type="button"
                  class={currentParticipant?.selectedCard === card ? 'selected' : ''}
                  onClick={() => void onVote(card)}
                  disabled={!participantId}
                >
                  {card}
                </button>
              ))}
            </div>
          </section>

          <section class="card">
            <h2>Results</h2>
            <table class="results-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Chosen value</th>
                </tr>
              </thead>
              <tbody>
                {room.participants.map((participant) => (
                  <tr key={participant.id}>
                    <th scope="row">{participant.name}</th>
                    <td>
                      {!participant.hasVoted
                        ? 'Not voted'
                        : room.isRevealed
                          ? participant.selectedCard
                          : 'Hidden'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section class="actions">
            <button type="button" onClick={() => void onReveal()} disabled={!hasVotes}>
              Reveal
            </button>
            <button type="button" onClick={() => void onReset()}>
              Reset
            </button>
          </section>
        </>
      ) : (
        <p>Loading room...</p>
      )}
    </main>
  )
}
