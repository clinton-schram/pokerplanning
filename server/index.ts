import { serve } from '@hono/node-server'
import { createApp } from './app.js'

const port = Number(process.env.PORT ?? 3000)
const hostname = process.env.HOST ?? '0.0.0.0'
const displayHost = hostname === '0.0.0.0' ? 'localhost' : hostname

serve(
  {
    fetch: createApp().fetch,
    hostname,
    port,
  },
  () => {
    // eslint-disable-next-line no-console
    console.log(`Poker Planning API listening on http://${displayHost}:${port}`)
  },
)
