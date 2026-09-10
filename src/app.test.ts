import { h, render } from 'preact'
import { act } from 'preact/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { JoinRoomResponse, Room } from './lib/types'

const apiMocks = vi.hoisted(() => ({
  createRoom: vi.fn(),
  fetchRoom: vi.fn<() => Promise<Room>>(),
  joinRoom: vi.fn<() => Promise<JoinRoomResponse>>(),
  resetRoom: vi.fn(),
  revealRoom: vi.fn(),
  submitVote: vi.fn(),
}))

const nameCacheMocks = vi.hoisted(() => ({
  getCachedUserName: vi.fn(),
  saveCachedUserName: vi.fn(),
}))

vi.mock('./lib/api', () => apiMocks)
vi.mock('./lib/nameCache', () => nameCacheMocks)

import { App } from './app'

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="app"></div>'
    window.history.pushState({}, '', '/room/ROOM1')

    nameCacheMocks.getCachedUserName.mockReturnValue('Alice')
    nameCacheMocks.saveCachedUserName.mockReset()

    apiMocks.createRoom.mockReset()
    apiMocks.fetchRoom.mockReset()
    apiMocks.joinRoom.mockReset()
    apiMocks.resetRoom.mockReset()
    apiMocks.revealRoom.mockReset()
    apiMocks.submitVote.mockReset()
  })

  afterEach(() => {
    const root = document.getElementById('app')
    if (root) {
      act(() => render(null, root))
    }
    vi.useRealTimers()
    window.history.pushState({}, '', '/')
  })

  it('highlights updated statuses and results briefly after room changes', async () => {
    const initialRoom: Room = {
      id: 'ROOM1',
      isRevealed: false,
      participants: [
        {
          id: 'participant-1',
          name: 'Alice',
          hasVoted: false,
          selectedCard: null,
        },
      ],
    }
    const updatedRoom: Room = {
      id: 'ROOM1',
      isRevealed: false,
      participants: [
        {
          id: 'participant-1',
          name: 'Alice',
          hasVoted: true,
          selectedCard: '5',
        },
      ],
    }

    apiMocks.joinRoom.mockResolvedValue({
      participantId: 'participant-1',
      room: initialRoom,
    })
    apiMocks.fetchRoom.mockResolvedValueOnce(initialRoom).mockResolvedValue(updatedRoom)

    const root = document.getElementById('app')!

    await act(async () => {
      render(h(App, {}), root)
      await Promise.resolve()
    })

    expect(root.querySelector('.status.updated')).toBeNull()
    expect(root.querySelector('.result-value.updated')).toBeNull()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })

    expect(root.querySelector('.status.updated')?.textContent).toBe('Voted')
    expect(root.querySelector('.result-value.updated')?.textContent).toBe('Hidden')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(900)
    })

    expect(root.querySelector('.status.updated')).toBeNull()
    expect(root.querySelector('.result-value.updated')).toBeNull()
  })
})
