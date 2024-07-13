import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { getScreenshot } from './browser'

const app = new Hono()
app.use(logger())
app.get('/', async (c) => {
  try {
    const { url, width, height } = c.req.query()

    if (!url) {
      c.status(400)
      return c.json({
        error:
          'Please include valid URL, e.g https://ss.sngr.xyz?url=https://www.sngr.xyz'
      })
    }

    const img = await getScreenshot({
      url: new URL(url),
      width: width ? +width : undefined,
      height: height ? +height : undefined
    })

    c.status(200)
    c.header('Content-Type', 'image/png')
    return c.body(img)
  } catch (error) {
    c.status(500)
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown Error'
    })
  }
})

export default app
