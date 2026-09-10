import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'
import { RoomStore, RoomStoreError } from './roomStore.js'

const createOrJoinSchema = z.object({
  name: z.string().trim().min(1).max(40),
})

const voteSchema = z.object({
  participantId: z.string().uuid(),
  card: z.string(),
})

export function createApp(
  store = new RoomStore(),
  clientBuildRoot = resolve(process.cwd(), 'dist'),
) {
  const app = new Hono()

  if (existsSync(clientBuildRoot)) {
    const staticFiles = serveStatic({ root: clientBuildRoot })
    const spaEntry = serveStatic({ root: clientBuildRoot, path: 'index.html' })

    app.use('*', async (context, next) => {
      if (context.req.path.startsWith('/api')) {
        return next()
      }

      if (context.req.path === '/' || !context.req.path.includes('.')) {
        return spaEntry(context, next)
      }

      return staticFiles(context, next)
    })
  }

  app.post('/api/rooms', async (context) => {
    const body = createOrJoinSchema.parse(await context.req.json())
    const room = store.createRoom(body.name)
    return context.json(room, 201)
  })

  app.get('/api/rooms/:roomId', (context) => {
    const room = store.getRoom(context.req.param('roomId'))
    return context.json({ room })
  })

  app.post('/api/rooms/:roomId/join', async (context) => {
    const body = createOrJoinSchema.parse(await context.req.json())
    const room = store.joinRoom(context.req.param('roomId'), body.name)
    return context.json(room, 201)
  })

  app.post('/api/rooms/:roomId/vote', async (context) => {
    const body = voteSchema.parse(await context.req.json())
    const room = store.vote(context.req.param('roomId'), body.participantId, body.card)
    return context.json({ room })
  })

  app.post('/api/rooms/:roomId/reveal', (context) => {
    const room = store.reveal(context.req.param('roomId'))
    return context.json({ room })
  })

  app.post('/api/rooms/:roomId/reset', (context) => {
    const room = store.reset(context.req.param('roomId'))
    return context.json({ room })
  })

  app.onError((error, context) => {
    if (error instanceof RoomStoreError) {
      context.status(error.status === 404 ? 404 : 400)
      return context.json({ error: error.message })
    }

    if (error instanceof z.ZodError) {
      return context.json({ error: 'Invalid request payload.' }, 400)
    }

    return context.json({ error: 'Internal server error.' }, 500)
  })

  return app
}
