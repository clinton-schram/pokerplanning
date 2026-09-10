import { h, render } from 'preact'
import { act } from 'preact/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './app'
import type { Room } from './lib/types'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

async function findButton(container: HTMLElement, label: string) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await flushEffects()
    const button = Array.from(container.querySelectorAll('button')).find(
      (entry) => entry.textContent === label,
    )
    if (button) {
      return button
    }
  }

  return null
}

async function waitFor(check: () => boolean) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await flushEffects()
    if (check()) {
      return true
    }
  }

  return false
}

describe('App room interactions', () => {
  let container: HTMLDivElement
  let room: Room
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    window.localStorage.clear()
    window.history.pushState({}, '', '/')

    room = {
      id: 'ROOM1234',
      facilitatorId: 'facilitator-id',
      isRevealed: false,
      participants: [
        { id: 'facilitator-id', name: 'Alice', hasVoted: false, selectedCard: null },
        { id: 'participant-id', name: 'Bob', hasVoted: true, selectedCard: '5' },
      ],
    }

    fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = (init?.method ?? 'GET').toUpperCase()

      if (url === '/api/rooms' && method === 'POST') {
        return jsonResponse({ room, participantId: 'facilitator-id' }, 201)
      }

      if (url === '/api/rooms/ROOM1234' && method === 'GET') {
        return jsonResponse({ room })
      }

      if (url === '/api/rooms/ROOM1234/participants/participant-id' && method === 'DELETE') {
        room = {
          ...room,
          participants: room.participants.filter((participant) => participant.id !== 'participant-id'),
        }
        return jsonResponse({ room })
      }

      throw new Error(`Unexpected request: ${method} ${url}`)
    })

    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(window, 'setInterval').mockImplementation(() => 0)
    vi.spyOn(window, 'clearInterval').mockImplementation(() => undefined)
  })

  afterEach(() => {
    act(() => render(null, container))
    container.remove()
    window.localStorage.clear()
    window.history.pushState({}, '', '/')
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  async function renderCreatedRoom() {
    act(() => {
      render(h(App, {}), container)
    })

    const nameInput = container.querySelector('input[placeholder="Jane"]') as HTMLInputElement | null
    expect(nameInput).toBeTruthy()

    await act(async () => {
      nameInput!.value = 'Alice'
      nameInput!.dispatchEvent(new Event('input', { bubbles: true }))
    })

    const createButton = await findButton(container, 'Create Room')
    expect(createButton).toBeTruthy()

    await act(async () => {
      createButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    await flushEffects()
  }

  it('copies the room link with the Clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    await renderCreatedRoom()

    const copyButton = await findButton(container, 'Copy Link')
    expect(copyButton).toBeTruthy()

    await act(async () => {
      copyButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/room/ROOM1234`)
    expect(container.textContent).not.toContain('Unable to copy room link.')
  })

  it('falls back to document.execCommand when the Clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    })

    await renderCreatedRoom()

    const copyButton = await findButton(container, 'Copy Link')
    expect(copyButton).toBeTruthy()

    await act(async () => {
      copyButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(container.textContent).not.toContain('Unable to copy room link.')
  })

  it('opens a confirmation modal, restores focus on cancel, and removes on confirm', async () => {
    await renderCreatedRoom()

    const openModalButton = await findButton(container, 'Remove')
    expect(openModalButton).toBeTruthy()

    openModalButton!.focus()
    act(() => {
      openModalButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const cancelButton = await findButton(container, 'Cancel')
    expect(cancelButton).toBeTruthy()
    expect(document.activeElement).toBe(cancelButton)
    expect(container.textContent).toContain('Are you sure you want to remove Bob from the room?')

    act(() => {
      cancelButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.textContent).not.toContain('Are you sure you want to remove Bob from the room?')
    expect(document.activeElement).toBe(openModalButton)

    act(() => {
      openModalButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const confirmButton = await findButton(container, 'Remove person')
    expect(confirmButton).toBeTruthy()

    await act(async () => {
      confirmButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    expect(
      await waitFor(() => !container.textContent?.includes('Are you sure you want to remove Bob from the room?')),
    ).toBe(true)

    expect(fetchMock).toHaveBeenCalledWith('/api/rooms/ROOM1234/participants/participant-id', {
      body: JSON.stringify({ actorParticipantId: 'facilitator-id' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'DELETE',
    })
    expect(container.textContent).not.toContain('Are you sure you want to remove Bob from the room?')
    expect(container.textContent).not.toContain('Bob')
  })
})
