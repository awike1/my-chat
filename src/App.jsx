import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    supabase
      .from('chat_logs')
      .select('role, content')
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data && data.length) setMessages(data)
      })
  }, [])

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')

    await supabase.from('chat_logs').insert({ role: 'user', content: userMsg.content })

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: history,
        stream: false
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      setMessages([...history, { role: 'assistant', content: '出错 ' + res.status + '：' + errText.slice(0, 300) }])
      return
    }
    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || 'AI没回内容'

    await supabase.from('chat_logs').insert({ role: 'assistant', content: reply })
    setMessages([...history, { role: 'assistant', content: reply }])
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>雯雯的聊天室</h2>
      <div style={{ minHeight: 400, border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <p key={i} style={{ textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <b>{m.role === 'user' ? '你' : 'AI'}：</b>{m.content}
          </p >
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="说点什么…"
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
        />
        <button onClick={send} style={{ padding: '8px 16px', borderRadius: 4, border: 'none', background: '#4f46e5', color: '#fff' }}>
          发送
        </button>
      </div>
    </div>
  )
}
