/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import puppeteer from '@cloudflare/puppeteer'

interface Env {
  BROWSER: Fetcher
  BROWSER_KV_DEMO: KVNamespace
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    try {
      const requestUrl = new URL(request.url)
      const url = requestUrl.searchParams.get('url')
      const width = requestUrl.searchParams.get('width')
      const height = requestUrl.searchParams.get('height')
      let img: Buffer | null

      if (!url)
        throw new Error(
          'URL is not provided, e.g: https://ss.sngr.xyz/?url=https://sngr.xyz'
        )

      const urlNormalized = new URL(url).toString()
      img = await env.BROWSER_KV_DEMO.get(urlNormalized, {
        type: 'arrayBuffer'
      })
      if (!img) {
        const browser = await puppeteer.launch(env.BROWSER)
        const page = await browser.newPage()

        await page.goto(urlNormalized)
        img = await page.screenshot()
        await env.BROWSER_KV_DEMO.put(urlNormalized, img, {
          expirationTtl: 60 * 60 * 24 * 30
        })
        await browser.close()
      }

      return new Response(img, {
        headers: {
          'Content-Type': 'image/jpeg'
        }
      })
    } catch (error) {
      return new Response(
        JSON.stringify({
          error:
            error instanceof Error ? error.message : 'Unknown error happened.'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
  }
} satisfies ExportedHandler<Env>
