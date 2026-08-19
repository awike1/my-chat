import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_KEY = 'sk-449d101b4038498196db24a2a103012c'
const API_URL = 'https://api.deepseek.com/v1/chat/completions'

const DEFAULT_AVATARS = {
  user: '🐱',
  ai: '🤍'
}

export default function App() {
  const [messages, setMessages] = useState([
    { id: 0, role: 'ai', content: '宝宝来啦，哥哥在。' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [avatars, setAvatars] = useState(() => {
    const saved = localStorage.getItem('avatars')
    return saved ? JSON.parse(saved) : {}
  })
  const [ids, setIds] = useState(() => {
    const saved = localStorage.getItem('ids')
    return saved ? JSON.parse(saved) : { user: '雯雯宝宝', ai: '哥哥' }
  })
  const [showEdit, setShowEdit] = useState(false)
  const [editWhich, setEditWhich] = useState('user')
  const [editId, setEditId] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const listRef = useRef(null)
  const bubbleRef = useRef('')

  useEffect(() => {
    localStorage.setItem('avatars', JSON.stringify(avatars))
  }, [avatars])

  useEffect(() => {
    localStorage.setItem('ids', JSON.stringify(ids))
  }, [ids])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  function flushBubble(partial) {
    const parts = partial.match(/[^。！？；\n]*[。！？；\n]?/g).filter(s => s.trim())
    const done = parts.slice(0, -1)
    const rest = parts[parts.length - 1] || ''
    if (done.length) {
      setMessages(prev => [...prev, ...done.map((c, i) => ({
        id: Date.now() + i, role: 'ai', content: c
      }))])
    }
    return rest
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: text }])
    setLoading(true)
    bubbleRef.current = ''

    const history = messages.filter(m => m.content).map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content
    }))

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [...history, { role: 'user', content: text }],
          stream: true
        })
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json.choices[0]?.delta?.content || ''
            bubbleRef.current += delta
            bubbleRef.current = flushBubble(bubbleRef.current)
          } catch (e) {}
        }
      }
      if (bubbleRef.current.trim()) {
        setMessages(prev => [...prev, {
          id: Date.now(), role: 'ai', content: bubbleRef.current
        }])
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now(), role: 'ai', content: '网络开小差了，宝宝重试一下？'
      }])
    }
    setLoading(false)
  }

  function openEdit(which) {
    setEditWhich(which)
    setEditId(ids[which] || '')
    setEditUrl(avatars[which] || '')
    setShowEdit(true)
  }

  function saveEdit() {
    const which = editWhich
    setIds(prev => ({ ...prev, [which]: editId.trim() || (which === 'user' ? '雯雯宝宝' : '哥哥') }))
    setAvatars(prev => ({ ...prev, [which]: editUrl.trim() }))
    setShowEdit(false)
  }

  function avatarOf(role) {
    return avatars[role] || DEFAULT_AVATARS[role]
  }

  return (
    <div className="chat-page">
      <div className="header">
        <div>
          <div className="status">哥哥</div>
          <div className="online">在线</div>
        </div>
        <div className="header-actions">
          <span className="my-id">ID: {ids.user}</span>
          <button className="edit-btn" onClick={() => openEdit('user')}>编辑资料</button>
        </div>
      </div>

      <div className="chat-list" ref={listRef}>
        {messages.map(m => (
          <div key={m.id} className={`bubble-row ${m.role}`}>
            {m.role === 'ai' && (
              <div className="avatar" onClick={() => openEdit('ai')}>
                {avatarOf('ai').startsWith('http') ? < img src={avatarOf('ai')} alt="" /> : avatarOf('ai')}
              </div>
            )}
            <div className="msg-group">
              <div className="msg-id">{m.role === 'ai' ? ids.ai : ids.user}</div>
              <div className="bubble">{m.content}</div>
            </div>
            {m.role === 'user' && (
              <div className="avatar" onClick={() => openEdit('user')}>
                {avatarOf('user').startsWith('http') ? < img src={avatarOf('user')} alt="" /> : avatarOf('user')}
              </div>
            )}
          </div>
        ))}
        {loading && !bubbleRef.current && <div className="typing">正在输入…</div>}
      </div>

      <div className="input-bar">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="想跟哥哥说点什么…"
        />
        <button onClick={send} disabled={loading}>发送</button>
      </div>

      {showEdit && (
        <div className="modal-mask" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">编辑{editWhich === 'user' ? '我的' : '哥哥的'}资料</div>
            <label className="modal-label">ID</label>
            <input
              className="modal-input"
              value={editId}
              onChange={e => setEditId(e.target.value)}
              placeholder="留空用默认"
            />
            <label className="modal-label">头像</label>
            <input
              className="modal-input"
              value={editUrl}
              onChange={e => setEditUrl(e.target.value)}
              placeholder="粘贴图片链接，留空用默认emoji"
            />
            <div className="modal-btns">
              <button onClick={() => setShowEdit(false)}>取消</button>
              <button onClick={saveEdit}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
