import { Hono } from 'hono'
import type { Context } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { existsSync, statSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { z } from 'zod'
import { RoomStore, RoomStoreError } from './roomStore.js'

const createOrJoinSchema = z.object({
  name: z.string().trim().min(1).max(40),
})

const voteSchema = z.object({
  participantId: z.string().uuid(),
  card: z.string(),
})

function acceptsHtml(context: Context) {
  const accept = context.req.header('accept') ?? ''
  return accept.includes('text/html') || accept.includes('application/xhtml+xml')
}

function hasStaticFile(root: string, requestPath: string) {
  const filePath = resolve(root, `.${requestPath}`)
  const relativePath = relative(root, filePath)

  if (relativePath.startsWith('..')) {
    return false
  }

  try {
    return statSync(filePath).isFile()
  } catch {
    return false
  }
}

export function createApp(
  store = new RoomStore(),
  clientBuildRoot = resolve(process.cwd(), 'dist'),
) {
  const app = new Hono()

  if (existsSync(clientBuildRoot)) {
    const staticFiles = serveStatic({ root: clientBuildRoot })
    const spaEntry = serveStatic({ root: clientBuildRoot, path: 'index.html' })

    app.use('*', async (context, next) => {
      if (
        context.req.path.startsWith('/api') ||
        (context.req.method !== 'GET' && context.req.method !== 'HEAD')
      ) {
        return next()
      }

      if (hasStaticFile(clientBuildRoot, context.req.path)) {
        return staticFiles(context, next)
      }

      if (acceptsHtml(context)) {
        return spaEntry(context, next)
      }

      return next()
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
