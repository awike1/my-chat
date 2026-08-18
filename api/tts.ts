import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const API_KEY = process.env.ELEVENLABS_API_KEY
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID

  if (!API_KEY || !VOICE_ID) {
    return res.status(500).json({ error: 'Missing env: ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID' })
  }

  const { input } = req.body || {}
  if (!input) {
    return res.status(400).json({ error: 'Missing input text' })
  }

  // 转发到 ElevenLabs 原生接口
  const elevenResp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: input,
      model_id: 'eleven_flash_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  })

  if (!elevenResp.ok) {
    const err = await elevenResp.text()
    return res.status(elevenResp.status).json({ error: 'ElevenLabs error', detail: err })
  }

  const audio = await elevenResp.arrayBuffer()
  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('Cache-Control', 'no-cache')
  res.status(200).send(Buffer.from(audio))
}
