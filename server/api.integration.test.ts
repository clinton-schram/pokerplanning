// @vitest-environment node
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { RoomStore } from './roomStore.js'

describe('Poker planning API integration', () => {
  it('supports room lifecycle with join, vote, reveal, and reset', async () => {
    const app = createApp(new RoomStore())

    const createResponse = await app.request('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(createResponse.status).toBe(201)
    const created = (await createResponse.json()) as { room: { id: string }; participantId: string }
    const { id: roomId } = created.room

    const joinResponse = await app.request(`/api/rooms/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Bob' }),
      headers: { 'Content-Type': 'application/json' },
    })
    expect(joinResponse.status).toBe(201)
    const joined = (await joinResponse.json()) as { participantId: string }

    const voteOne = await app.request(`/api/rooms/${roomId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ participantId: created.participantId, card: '5' }),
      headers: { 'Content-Type': 'application/json' },
    })
    expect(voteOne.status).toBe(200)

    const voteTwo = await app.request(`/api/rooms/${roomId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ participantId: joined.participantId, card: '8' }),
      headers: { 'Content-Type': 'application/json' },
    })
    expect(voteTwo.status).toBe(200)

    const revealResponse = await app.request(`/api/rooms/${roomId}/reveal`, { method: 'POST' })
    expect(revealResponse.status).toBe(200)
    const revealed = (await revealResponse.json()) as {
      room: { isRevealed: boolean; participants: Array<{ selectedCard: string | null }> }
    }
    expect(revealed.room.isRevealed).toBe(true)
    expect(revealed.room.participants.map((participant) => participant.selectedCard)).toEqual(['5', '8'])

    const resetResponse = await app.request(`/api/rooms/${roomId}/reset`, { method: 'POST' })
    expect(resetResponse.status).toBe(200)
    const reset = (await resetResponse.json()) as {
      room: { isRevealed: boolean; participants: Array<{ hasVoted: boolean; selectedCard: string | null }> }
    }
    expect(reset.room.isRevealed).toBe(false)
    expect(reset.room.participants.every((participant) => !participant.hasVoted)).toBe(true)
    expect(reset.room.participants.every((participant) => participant.selectedCard === null)).toBe(true)
  })

  it('serves the built frontend with SPA fallback when a client build is present', async () => {
    const clientBuildRoot = await mkdtemp(join(tmpdir(), 'pokerplanning-'))

    try {
      await mkdir(join(clientBuildRoot, 'assets'))
      await writeFile(join(clientBuildRoot, 'index.html'), '<!doctype html><html><body>Poker Planning</body></html>')
      await writeFile(join(clientBuildRoot, 'assets', 'app.js'), 'console.log("ready")')

      const app = createApp(new RoomStore(), clientBuildRoot)

      const homeResponse = await app.request('/')
      expect(homeResponse.status).toBe(200)
      expect(await homeResponse.text()).toContain('Poker Planning')

      const roomResponse = await app.request('/room/AB12CD34')
      expect(roomResponse.status).toBe(200)
      expect(await roomResponse.text()).toContain('Poker Planning')

      const assetResponse = await app.request('/assets/app.js')
      expect(assetResponse.status).toBe(200)
      expect(await assetResponse.text()).toContain('ready')

      const missingAssetResponse = await app.request('/assets/missing.js')
      expect(missingAssetResponse.status).toBe(404)
    } finally {
      await rm(clientBuildRoot, { recursive: true, force: true })
    }
  })
})
