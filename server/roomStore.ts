import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import type { CardValue, Participant, Room } from '../src/lib/types.js'
import { AVAILABLE_CARDS } from '../src/lib/types.js'

const nameSchema = z.string().trim().min(1).max(40)
const cardSchema = z.enum(AVAILABLE_CARDS)

type StoreRoom = {
  id: string
  facilitatorId: string
  isRevealed: boolean
  participants: Participant[]
}

export class RoomStoreError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export class RoomStore {
  private readonly rooms = new Map<string, StoreRoom>()

  createRoom(name: string) {
    const normalizedName = nameSchema.parse(name)
    const roomId = this.newRoomId()
    const participant = this.newParticipant(normalizedName)
    const room: StoreRoom = {
      id: roomId,
      facilitatorId: participant.id,
      isRevealed: false,
      participants: [participant],
    }
    this.rooms.set(roomId, room)
    return {
      room: this.toResponseRoom(room),
      participantId: participant.id,
    }
  }

  getRoom(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new RoomStoreError(404, 'Room not found.')
    }
    return this.toResponseRoom(room)
  }

  joinRoom(roomId: string, name: string) {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new RoomStoreError(404, 'Room not found.')
    }

    const normalizedName = nameSchema.parse(name)
    const existing = room.participants.find((participant) => participant.name === normalizedName)
    if (existing) {
      return {
        room: this.toResponseRoom(room),
        participantId: existing.id,
      }
    }

    const participant = this.newParticipant(normalizedName)
    room.participants.push(participant)
    return {
      room: this.toResponseRoom(room),
      participantId: participant.id,
    }
  }

  vote(roomId: string, participantId: string, card: string) {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new RoomStoreError(404, 'Room not found.')
    }

    const normalizedCard = cardSchema.parse(card)
    const participant = room.participants.find((entry) => entry.id === participantId)
    if (!participant) {
      throw new RoomStoreError(404, 'Participant not found.')
    }

    participant.hasVoted = true
    participant.selectedCard = normalizedCard
    return this.toResponseRoom(room)
  }

  reveal(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new RoomStoreError(404, 'Room not found.')
    }

    if (!room.participants.some((participant) => participant.hasVoted)) {
      throw new RoomStoreError(400, 'At least one vote is required to reveal.')
    }

    room.isRevealed = true
    return this.toResponseRoom(room)
  }

  reset(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new RoomStoreError(404, 'Room not found.')
    }

    for (const participant of room.participants) {
      participant.hasVoted = false
      participant.selectedCard = null
    }
    room.isRevealed = false

    return this.toResponseRoom(room)
  }

  removeParticipant(roomId: string, actorParticipantId: string, targetParticipantId: string) {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new RoomStoreError(404, 'Room not found.')
    }

    const actor = room.participants.find((participant) => participant.id === actorParticipantId)
    if (!actor) {
      throw new RoomStoreError(404, 'Participant not found.')
    }

    if (actor.id !== room.facilitatorId) {
      throw new RoomStoreError(403, 'Only the facilitator can remove participants.')
    }

    if (targetParticipantId === room.facilitatorId) {
      throw new RoomStoreError(400, 'The facilitator cannot be removed.')
    }

    const participantIndex = room.participants.findIndex((participant) => participant.id === targetParticipantId)
    if (participantIndex === -1) {
      throw new RoomStoreError(404, 'Participant not found.')
    }

    room.participants.splice(participantIndex, 1)
    return this.toResponseRoom(room)
  }

  private toResponseRoom(room: StoreRoom): Room {
    return {
      id: room.id,
      facilitatorId: room.facilitatorId,
      isRevealed: room.isRevealed,
      participants: room.participants.map((participant) => ({ ...participant })),
    }
  }

  private newParticipant(name: string): Participant {
    return {
      id: randomUUID(),
      name,
      hasVoted: false,
      selectedCard: null,
    }
  }

  private newRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let nextId = ''
    do {
      nextId = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
        '',
      )
    } while (this.rooms.has(nextId))
    return nextId
  }
}

export function isCardValue(card: string): card is CardValue {
  return AVAILABLE_CARDS.includes(card as CardValue)
}
