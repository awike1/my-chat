import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })
  const { app, on } = req.query
  await supabase.from('controls').update({
    enabled: on === 'true',
    blocked_app: app
  }).eq('id', 1)
  res.json({ ok: true, app, on })
}
