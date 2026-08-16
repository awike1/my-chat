import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })
    const { app, on } = req.query
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
    const { error } = await supabase.from('controls')
      .update({ enabled: on === 'true', blocked_app: app })
      .eq('id', 1)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ ok: true, app, on })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
