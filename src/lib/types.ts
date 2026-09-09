export const AVAILABLE_CARDS = [
  '0',
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '21',
  '34',
  '55',
  '89',
  '?',
  '☕',
] as const

export type CardValue = (typeof AVAILABLE_CARDS)[number]

export type Participant = {
  id: string
  name: string
  selectedCard: CardValue | null
  hasVoted: boolean
}

export type Room = {
  id: string
  participants: Participant[]
  isRevealed: boolean
}

export type RoomResponse = {
  room: Room
}

export type JoinRoomResponse = RoomResponse & {
  participantId: string
}
