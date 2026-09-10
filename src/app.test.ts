import { h, render } from 'preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { createRoom, fetchRoom, joinRoom, resetRoom, revealRoom, submitVote } = vi.hoisted(() => ({
  createRoom: vi.fn(),
  fetchRoom: vi.fn(),
  joinRoom: vi.fn(),
  resetRoom: vi.fn(),
  revealRoom: vi.fn(),
  submitVote: vi.fn(),
}))

vi.mock('./lib/api', () => ({
  createRoom,
  fetchRoom,
  joinRoom,
  resetRoom,
  revealRoom,
  submitVote,
}))

import { App } from './app'

const room = {
  id: 'ROOM1234',
  revealed: false,
  participants: [{ id: 'participant-1', name: 'Alice', hasVoted: false }],
}

async function flush() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('App share link', () => {
  let root: HTMLDivElement
  let clipboard: { writeText: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    root = document.createElement('div')
    document.body.appendChild(root)
    window.localStorage.clear()
    window.history.pushState({}, '', '/room/ROOM1234')

    createRoom.mockReset()
    fetchRoom.mockReset()
    joinRoom.mockReset()
    resetRoom.mockReset()
    revealRoom.mockReset()
    submitVote.mockReset()
    fetchRoom.mockResolvedValue(room)

    clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    }
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: clipboard,
    })
  })

  afterEach(() => {
    render(null, root)
    root.remove()
    vi.restoreAllMocks()
  })

  it('shows the room link in the header', async () => {
    render(h(App, {}), root)
    await flush()

    const shareLink = root.querySelector('.room-link input') as HTMLInputElement | null
    expect(shareLink?.value).toBe(`${window.location.origin}/room/ROOM1234`)
  })

  it('copies the room link with the clipboard api', async () => {
    render(h(App, {}), root)
    await flush()

    const button = root.querySelector('button')
    button?.click()
    await flush()

    expect(clipboard.writeText).toHaveBeenCalledWith(`${window.location.origin}/room/ROOM1234`)
    expect(root.textContent).toContain('Link copied.')
  })

  it('shows a manual fallback message when automatic copy fails', async () => {
    clipboard.writeText.mockRejectedValue(new Error('denied'))
    const execCommand = vi.fn().mockReturnValue(false)
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    })

    render(h(App, {}), root)
    await flush()

    const button = root.querySelector('button')
    button?.click()
    await flush()

    expect(execCommand).toHaveBeenCalledWith('copy')
    const shareLink = root.querySelector('.room-link input') as HTMLInputElement | null
    expect(shareLink?.value).toBe(`${window.location.origin}/room/ROOM1234`)
    expect(root.textContent).toContain('Copy the link below manually.')
  })

  it('falls back to document copy when the clipboard api is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    })

    render(h(App, {}), root)
    await flush()

    const button = root.querySelector('button')
    button?.click()
    await flush()

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(root.textContent).toContain('Link copied.')
  })
})
