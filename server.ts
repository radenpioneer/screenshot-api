import { Hono } from 'hono'
import { logger } from 'hono/logger'
import puppeteer from 'puppeteer-core'

const BROWSER_ENDPOINT = process.env.BROWSER_ENDPOINT
const TOKEN = process.env.TOKEN

const app = new Hono()
app.use(logger())
app.get('/', async (c) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: `ws://${BROWSER_ENDPOINT || 'localhost:3001'}?token=${TOKEN}&launch=${JSON.stringify({ headless: false })}`
    })
    const page = await browser.newPage()

    await page.goto('https://v0.tintaborneo.com', { waitUntil: 'networkidle0' })
    const img = await page.screenshot({ type: 'png' })
    await browser.close()

    c.status(200)
    c.header('Content-Type', 'image/png')
    return c.body(img.buffer as ArrayBuffer)
  } catch (error) {
    c.status(500)
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown Error'
    })
  }
})

export default app
