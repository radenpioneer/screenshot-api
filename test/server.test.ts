import { describe, expect, it } from 'bun:test'
import app from '../server'

describe('Test Request', () => {
  it('Return 200', async () => {
    const req = new Request('http://localhost/')
    const res = await app.fetch(req)
    expect(res.status).toBe(200)
  })
})
