import type { JoinRoomResponse, Room, RoomResponse } from './types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error ?? 'Request failed.')
  }

  return (await response.json()) as T
}

export function createRoom(name: string) {
  return request<JoinRoomResponse>('/api/rooms', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function joinRoom(roomId: string, name: string) {
  return request<JoinRoomResponse>(`/api/rooms/${roomId}/join`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function fetchRoom(roomId: string): Promise<Room> {
  const response = await request<RoomResponse>(`/api/rooms/${roomId}`)
  return response.room
}

export function submitVote(roomId: string, participantId: string, card: string) {
  return request<RoomResponse>(`/api/rooms/${roomId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ participantId, card }),
  })
}

export function revealRoom(roomId: string) {
  return request<RoomResponse>(`/api/rooms/${roomId}/reveal`, {
    method: 'POST',
  })
}

export function resetRoom(roomId: string) {
  return request<RoomResponse>(`/api/rooms/${roomId}/reset`, {
    method: 'POST',
  })
}

export function removeParticipant(roomId: string, actorParticipantId: string, targetParticipantId: string) {
  return request<RoomResponse>(`/api/rooms/${roomId}/participants/${targetParticipantId}`, {
    method: 'DELETE',
    body: JSON.stringify({ actorParticipantId }),
  })
}
