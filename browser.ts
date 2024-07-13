import puppeteer from 'puppeteer-core'

const BROWSER_ENDPOINT = process.env.BROWSER_ENDPOINT
const TOKEN = process.env.TOKEN

export const getScreenshot = async ({
  url,
  width,
  height
}: {
  url: URL
  width?: number
  height?: number
}) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `ws://${BROWSER_ENDPOINT || 'localhost:3001'}?token=${TOKEN}&launch=${JSON.stringify({ headless: false })}`
  })
  const page = await browser.newPage()

  page.setViewport({
    width: width || 1280,
    height: height || 720
  })
  await page.goto(new URL(url).toString(), { waitUntil: 'networkidle0' })
  const img = await page.screenshot({ type: 'png' })
  await browser.close()

  return img.buffer as ArrayBuffer
}
