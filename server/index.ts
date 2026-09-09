import { serve } from '@hono/node-server'
import { createApp } from './app.js'

const port = Number(process.env.PORT ?? 3000)

serve(
  {
    fetch: createApp().fetch,
    port,
  },
  () => {
    // eslint-disable-next-line no-console
    console.log(`Poker Planning API listening on http://localhost:${port}`)
  },
)
