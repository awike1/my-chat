import { useState } from 'react'
import './App.css'

const APPS = [
  { id: 'wechat', name: '微信', icon: '💬', color: '#7ed321' },
  { id: 'worldbook', name: '世界书', icon: '📖', color: '#f5a623' },
  { id: 'diary', name: '日记', icon: '📓', color: '#ff9ec2' },
  { id: 'x', name: 'X', icon: '🐦', color: '#4a4a4a' },
  { id: 'album', name: '相册', icon: '🖼️', color: '#50e3c2' },
  { id: 'music', name: '音乐', icon: '🎵', color: '#ff6b6b' },
]

export default function App() {
  const [screen, setScreen] = useState('home')
  const [activeApp, setActiveApp] = useState(null)
  const [name, setName] = useState(() => localStorage.getItem('myName') || '雯雯宝宝')
  const [showNameEdit, setShowNameEdit] = useState(false)
  const [nameInput, setNameInput] = useState(name)

  const today = new Date()
  const week = ['日', '一', '二', '三', '四', '五', '六']

  function openApp(app) {
    setActiveApp(app)
    setScreen('app')
  }

  function saveName() {
    const v = nameInput.trim() || '雯雯宝宝'
    setName(v)
    localStorage.setItem('myName', v)
    setShowNameEdit(false)
  }

  return (
    <div className="phone-page">
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

      {screen === 'settings' && (
        <div className="simple-page">
          <h2>设置</h2>
          <p>API供应商、API接入（第三步做）</p>
          <button className="back-btn" onClick={() => setScreen('home')}>‹ 返回首页</button>
        </div>
      )}

      {screen === 'fonts' && (
        <div className="simple-page">
          <h2>字体</h2>
          <p>输入字体链接（第三步做）</p>
          <button className="back-btn" onClick={() => setScreen('home')}>‹ 返回首页</button>
        </div>
      )}

      {screen === 'app' && (
        <div className="simple-page">
          <h2>{activeApp?.name}</h2>
          <p>{activeApp?.name}界面待做，下一步做微信</p>
          <button className="back-btn" onClick={() => setScreen('home')}>‹ 返回首页</button>
        </div>
      )}

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
