import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
    const { app, on } = req.query

    // 先读一次，看它连的是哪个库
    const { data, error: readError } = await supabase
      .from('controls').select('*').eq('id', 1)

    // 再更新
    const { error: updateError } = await supabase
      .from('controls')
      .update({ enabled: on === 'true', blocked_app: app })
      .eq('id', 1)

    res.json({
      ok: true,
      app, on,
      readData: data,
      readError: readError?.message || null,
      updateError: updateError?.message || null,
      envUrl: process.env.SUPABASE_URL
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
