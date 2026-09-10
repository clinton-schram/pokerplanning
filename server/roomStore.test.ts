// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { RoomStore, RoomStoreError } from './roomStore.js'

describe('RoomStore', () => {
  it('creates a room with a creator participant', () => {
    const store = new RoomStore()
    const created = store.createRoom('Alice')

    expect(created.room.id).toHaveLength(8)
    expect(created.room.facilitatorId).toBe(created.participantId)
    expect(created.room.participants).toHaveLength(1)
    expect(created.room.participants[0].name).toBe('Alice')
    expect(created.participantId).toBe(created.room.participants[0].id)
  })

  it('allows voting, revealing, and resetting', () => {
    const store = new RoomStore()
    const created = store.createRoom('Alice')

    const voted = store.vote(created.room.id, created.participantId, '8')
    expect(voted.participants[0].hasVoted).toBe(true)
    expect(voted.participants[0].selectedCard).toBe('8')

    const revealed = store.reveal(created.room.id)
    expect(revealed.isRevealed).toBe(true)

    const reset = store.reset(created.room.id)
    expect(reset.isRevealed).toBe(false)
    expect(reset.participants[0].hasVoted).toBe(false)
    expect(reset.participants[0].selectedCard).toBe(null)
  })

  it('rejects reveal when no one has voted', () => {
    const store = new RoomStore()
    const created = store.createRoom('Alice')

    expect(() => store.reveal(created.room.id)).toThrowError(RoomStoreError)
    expect(() => store.reveal(created.room.id)).toThrow('At least one vote is required to reveal.')
  })

  it('allows the facilitator to remove another participant', () => {
    const store = new RoomStore()
    const created = store.createRoom('Alice')
    const joined = store.joinRoom(created.room.id, 'Bob')

    const updated = store.removeParticipant(created.room.id, created.participantId, joined.participantId)

    expect(updated.participants).toHaveLength(1)
    expect(updated.participants[0].name).toBe('Alice')
  })

  it('rejects participant removal by a non-facilitator', () => {
    const store = new RoomStore()
    const created = store.createRoom('Alice')
    const joined = store.joinRoom(created.room.id, 'Bob')

    expect(() => store.removeParticipant(created.room.id, joined.participantId, created.participantId)).toThrow(
      'Only the facilitator can remove participants.',
    )
  })

  it('rejects attempts to remove the facilitator', () => {
    const store = new RoomStore()
    const created = store.createRoom('Alice')
    store.joinRoom(created.room.id, 'Bob')

    expect(() => store.removeParticipant(created.room.id, created.participantId, created.participantId)).toThrow(
      'The facilitator cannot be removed.',
    )
  })
})
