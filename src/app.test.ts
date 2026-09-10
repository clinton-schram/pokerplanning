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

describe('App participant removal', () => {
  let container: HTMLDivElement
  let room: Room
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    window.localStorage.clear()
    window.localStorage.setItem('pokerplanning_user_name', 'Alice')
    window.history.pushState({}, '', '/room/ROOM1234')

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

      if (url === '/api/rooms/ROOM1234' && method === 'GET') {
        return jsonResponse({ room })
      }

      if (url === '/api/rooms/ROOM1234/join' && method === 'POST') {
        return jsonResponse({ room, participantId: 'facilitator-id' }, 201)
      }

      if (url === '/api/rooms/ROOM1234/participants/participant-id' && method === 'DELETE') {
        expect(init?.body).toBe(JSON.stringify({ actorParticipantId: 'facilitator-id' }))
        room = {
          ...room,
          participants: room.participants.filter((participant) => participant.id !== 'participant-id'),
        }
        return jsonResponse({ room })
      }

      throw new Error(`Unexpected request: ${method} ${url}`)
    })

    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    act(() => render(null, container))
    container.remove()
    window.localStorage.clear()
    window.history.pushState({}, '', '/')
    vi.unstubAllGlobals()
  })

  it('requires confirmation before removing a participant', async () => {
    act(() => {
      render(h(App, {}), container)
    })
    await flushEffects()

    const openModalButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Remove',
    )
    expect(openModalButton).toBeTruthy()

    act(() => {
      openModalButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.textContent).toContain('Are you sure you want to remove Bob from the room?')
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/rooms/ROOM1234/participants/participant-id',
      expect.anything(),
    )

    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancel',
    )
    act(() => {
      cancelButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.textContent).not.toContain('Are you sure you want to remove Bob from the room?')
    expect(container.textContent).toContain('Bob')

    act(() => {
      openModalButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const confirmButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Remove person',
    )
    await act(async () => {
      confirmButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    expect(container.textContent).not.toContain('Bob')
    expect(container.textContent).not.toContain('Are you sure you want to remove Bob from the room?')
  })
})
