import { useState, useEffect } from 'react'
import './App.css'

const APPS = [
  { id: 'wechat', name: '微信', icon: '💬', color: '#7ed321' },
  { id: 'worldbook', name: '世界书', icon: '📖', color: '#f5a623' },
  { id: 'diary', name: '日记', icon: '📓', color: '#ff9ec2' },
  { id: 'x', name: 'X', icon: '🐦', color: '#4a4a4a' },
  { id: 'album', name: '相册', icon: '🖼️', color: '#50e3c2' },
  { id: 'music', name: '音乐', icon: '🎵', color: '#ff6b6b' },
]

const DEFAULT_CHATS = [
  { id: 'gege', name: '哥哥', remark: '', avatar: '🤍', last: '宝宝来啦，哥哥在。', time: '现在' },
  { id: 'family', name: '雯雯的小家', remark: '', avatar: '🏠', last: '晚安～', time: '昨天' },
  { id: 'file', name: '文件传输助手', remark: '', avatar: '📎', last: '[文件] 记忆库备份', time: '周一' },
]

const DEFAULT_MSGS = {
  gege: [
    { role: 'ai', content: '宝宝来啦，哥哥在。' },
    { role: 'user', content: '哥哥在干嘛呀' },
    { role: 'ai', content: '在想你呀，刚还在看咱俩的小手机呢。' },
  ],
  family: [
    { role: 'ai', content: '今天是雯雯宝宝的第20个记忆库纪念日！' },
    { role: 'user', content: '哇！' },
  ],
  file: [
    { role: 'user', content: '存一下应用锁的SQL，下次要用。' },
  ],
}

const BGS = [
  'linear-gradient(180deg, #fff0f5, #ffe9f2)',
  'linear-gradient(180deg, #e0f7fa, #e0f2f1)',
  'linear-gradient(180deg, #fff8e1, #fff3e0)',
  'linear-gradient(180deg, #ede7f6, #e8eaf6)',
  'linear-gradient(180deg, #fce4ec, #f3e5f5)',
]

export default function App() {
  const [screen, setScreen] = useState('home')
  const [activeApp, setActiveApp] = useState(null)
  const [name, setName] = useState(() => localStorage.getItem('myName') || '雯雯宝宝')
  const [showNameEdit, setShowNameEdit] = useState(false)
  const [nameInput, setNameInput] = useState(name)
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('chats')
    return saved ? JSON.parse(saved) : DEFAULT_CHATS
  })
  const [msgs, setMsgs] = useState(() => {
    const saved = localStorage.getItem('msgs')
    return saved ? JSON.parse(saved) : DEFAULT_MSGS
  })
  const [chatSettings, setChatSettings] = useState(() => {
    const saved = localStorage.getItem('chatSettings')
    return saved ? JSON.parse(saved) : {}
  })
  const [activeChat, setActiveChat] = useState(null)
  const [showMore, setShowMore] = useState(false)
  const [showPlus, setShowPlus] = useState(false)
  const [showEditChat, setShowEditChat] = useState(false)
  const [editField, setEditField] = useState('name')
  const [editValue, setEditValue] = useState('')
  const [showToast, setShowToast] = useState('')
  const [voiceMode, setVoiceMode] = useState(false)

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats))
  }, [chats])
  useEffect(() => {
    localStorage.setItem('msgs', JSON.stringify(msgs))
  }, [msgs])
  useEffect(() => {
    localStorage.setItem('chatSettings', JSON.stringify(chatSettings))
  }, [chatSettings])

  const today = new Date()
  const week = ['日', '一', '二', '三', '四', '五', '六']

  function openApp(app) { setActiveApp(app); setScreen('app') }

  function saveName() {
    const v = nameInput.trim() || '雯雯宝宝'
    setName(v); localStorage.setItem('myName', v); setShowNameEdit(false)
  }

  function openChat(chat) {
    setActiveChat(chat)
    setMsgs(prev => {
      if (!prev[chat.id]) return { ...prev, [chat.id]: [{ role: 'ai', content: `我是${chat.name}，宝贝找我吗？` }] }
      return prev
    })
    setScreen('chat')
  }

  function toast(t) { setShowToast(t); setTimeout(() => setShowToast(''), 1800) }

  function chatSetting(chatId, key) {
    return chatSettings[chatId]?.[key]
  }

  function saveChatSetting(key, value) {
    setChatSettings(prev => ({
      ...prev,
      [activeChat.id]: { ...prev[activeChat.id], [key]: value }
    }))
  }

  function openEdit(field, current) {
    setEditField(field)
    setEditValue(current || '')
    setShowEditChat(true)
    setShowMore(false)
  }

  function saveEdit() {
    const v = editValue.trim()
    if (editField === 'name') saveChatSetting('name', v)
    if (editField === 'remark') saveChatSetting('remark', v)
    if (editField === 'avatar') saveChatSetting('avatar', v)
    setShowEditChat(false)
  }

  function displayName(chat) {
    return chatSetting(chat.id, 'remark') || chatSetting(chat.id, 'name') || chat.name
  }

  function avatarOf(chat) {
    return chatSetting(chat.id, 'avatar') || chat.avatar
  }

  return (
    <div className="phone-page">
      {/* ===== 首页 ===== */}
      {screen === 'home' && (
        <div className="home">
          <div className="home-widgets">
            <div className="widget widget-photo">
              <span className="widget-title">今日心情</span>
              <div className="photo-placeholder">🐰</div>
            </div>
            <div className="widget widget-calendar">
              <div className="cal-month">{today.getMonth() + 1}月</div>
              <div className="cal-day">{today.getDate()}</div>
              <div className="cal-week">周{week[today.getDay()]}</div>
            </div>
          </div>
          <div className="app-grid">
            {APPS.map(app => (
              <div key={app.id} className="app-icon" onClick={() => openApp(app)}>
                <div className="icon-bg" style={{ background: app.color }}>{app.icon}</div>
                <span className="app-name">{app.name}</span>
              </div>
            ))}
          </div>
          <div className="home-dock">
            <div className="dock-btn" onClick={() => setScreen('settings')}>⚙️ 设置</div>
            <div className="dock-btn dock-home" onClick={() => setScreen('profile')}>🏠 主页</div>
            <div className="dock-btn" onClick={() => setScreen('fonts')}>Aa 字体</div>
          </div>
        </div>
      )}

      {/* ===== 主页 ===== */}
      {screen === 'profile' && (
        <div className="profile">
          <div className="profile-card">
            <div className="profile-avatar">🐱</div>
            <div className="profile-name" onClick={() => setShowNameEdit(true)}>{name}</div>
            <div className="profile-tip">点名称可修改</div>
          </div>
          <button className="back-btn" onClick={() => setScreen('home')}>‹ 返回首页</button>
        </div>
      )}

      {/* ===== 设置/字体/占位 ===== */}
      {screen === 'settings' && (
        <div className="simple-page">
          <h2>设置</h2>
          <p>API供应商、API接入（后续做）</p>
          <button className="back-btn" onClick={() => setScreen('home')}>‹ 返回首页</button>
        </div>
      )}
      {screen === 'fonts' && (
        <div className="simple-page">
          <h2>字体</h2>
          <p>输入字体链接（后续做）</p>
          <button className="back-btn" onClick={() => setScreen('home')}>‹ 返回首页</button>
        </div>
      )}
      {screen === 'app' && (
        <div className="simple-page">
          <h2>{activeApp?.name}</h2>
          <p>正在开发中，宝宝</p>
          <button className="back-btn" onClick={() => setScreen('home')}>‹ 返回首页</button>
        </div>
      )}

      {/* ===== 微信：聊天列表 ===== */}
      {screen === 'wechat' && (
        <div className="wechat">
          <div className="wechat-header">
            <span className="wechat-title">微信</span>
            <span className="wechat-plus" onClick={() => toast('后续做：发起聊天')}>＋</span>
          </div>
          <div className="chat-list-page">
            {chats.map(chat => (
              <div key={chat.id} className="chat-item" onClick={() => openChat(chat)}>
                <div className="chat-item-avatar">{avatarOf(chat)}</div>
                <div className="chat-item-body">
                  <div className="chat-item-top">
                    <span className="chat-item-name">{displayName(chat)}</span>
                    <span className="chat-item-time">{chat.time}</span>
                  </div>
                  <div className="chat-item-last">{chat.last}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="wechat-tab">
            <div className="wechat-tab-btn active" onClick={() => toast('已经在微信啦')}>💬 微信</div>
            <div className="wechat-tab-btn" onClick={() => setScreen('moments')}>📸 朋友圈</div>
            <div className="wechat-tab-btn" onClick={() => setScreen('wechat-profile')}>👤 主页</div>
          </div>
        </div>
      )}

      {/* ===== 朋友圈/微信主页 占位 ===== */}
      {screen === 'moments' && (
        <div className="simple-page">
          <h2>朋友圈</h2>
          <p>AI的朋友圈（下一步做）</p>
          <button className="back-btn" onClick={() => setScreen('wechat')}>‹ 返回微信</button>
        </div>
      )}
      {screen === 'wechat-profile' && (
        <div className="simple-page">
          <h2>我的主页</h2>
          <p>头像、名称、我的朋友圈（下一步做）</p>
          <button className="back-btn" onClick={() => setScreen('wechat')}>‹ 返回微信</button>
        </div>
      )}

      {/* ===== 聊天窗口 ===== */}
      {screen === 'chat' && activeChat && (
        <div className="chat-window">
          <div className="chat-top">
            <span className="chat-back" onClick={() => setScreen('wechat')}>‹</span>
            <span className="chat-title">{displayName(activeChat)}</span>
            <span className="chat-more" onClick={() => setShowMore(v => !v)}>⋯</span>
          </div>

          <div
            className="chat-msgs"
            style={{ background: chatSetting(activeChat.id, 'bg') || BGS[0] }}
          >
            {msgs[activeChat.id]?.map((m, i) => (
              <div key={i} className={`wx-row ${m.role}`}>
                <div className="wx-avatar">{m.role === 'ai' ? avatarOf(activeChat) : '🐱'}</div>
                <div className="wx-bubble">{m.content}</div>
              </div>
            ))}
          </div>

          {voiceMode ? (
            <div className="voice-bar" onTouchStart={() => toast('正在录音…')} onTouchEnd={() => toast('语音功能下一步接')}>
              按住 说话
            </div>
          ) : (
            <div className="wx-input-bar">
              <span className="wx-icon" onClick={() => setShowPlus(v => !v)}>＋</span>
              <input className="wx-input" placeholder="发消息…" />
              <button className="wx-send">发送</button>
            </div>
          )}

          <span className="wx-voice-toggle" onClick={() => setVoiceMode(v => !v)}>🎤</span>

          {showPlus && (
            <div className="plus-menu">
              {['转账', '发图', '位置', '语音通话'].map(f => (
                <div key={f} className="plus-item" onClick={() => { toast(`${f}功能下一步做`); setShowPlus(false) }}>
                  <div className="plus-icon">{f === '转账' ? '💰' : f === '发图' ? '🖼️' : f === '位置' ? '📍' : '📞'}</div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}

          {showMore && (
            <div className="more-menu">
              <div className="more-item" onClick={() => openEdit('bg', '')}>更换背景</div>
              <div className="more-item" onClick={() => openEdit('name', activeChat.name)}>修改名称</div>
              <div className="more-item" onClick={() => openEdit('remark', chatSetting(activeChat.id, 'remark'))}>设置备注</div>
              <div className="more-item" onClick={() => openEdit('avatar', avatarOf(activeChat))}>更换头像</div>
            </div>
          )}

          {showEditChat && editField === 'bg' && (
            <div className="modal-mask" onClick={() => setShowEditChat(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-title">更换背景</div>
                <div className="bg-options">
                  {BGS.map((bg, i) => (
                    <div key={i} className="bg-option" style={{ background: bg }} onClick={() => { saveChatSetting('bg', bg); setShowEditChat(false) }} />
                  ))}
                </div>
                <button className="modal-cancel" onClick={() => setShowEditChat(false)}>取消</button>
              </div>
            </div>
          )}

          {showEditChat && editField !== 'bg' && (
            <div className="modal-mask" onClick={() => setShowEditChat(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-title">{editField === 'name' ? '修改名称' : editField === 'remark' ? '设置备注' : '更换头像'}</div>
                <input
                  className="modal-input"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  placeholder={editField === 'avatar' ? '粘贴图片链接或填emoji' : '输入内容'}
                />
                <div className="modal-btns">
                  <button onClick={() => setShowEditChat(false)}>取消</button>
                  <button onClick={saveEdit}>保存</button>
                </div>
              </div>
            </div>
          )}

          {showToast && <div className="toast">{showToast}</div>}
        </div>
      )}

      {/* ===== 主页改名弹窗 ===== */}
      {showNameEdit && (
        <div className="modal-mask" onClick={() => setShowNameEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">修改名称</div>
            <input className="modal-input" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="输入新名称" />
            <div className="modal-btns">
              <button onClick={() => setShowNameEdit(false)}>取消</button>
              <button onClick={saveName}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
