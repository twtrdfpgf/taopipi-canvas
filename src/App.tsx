import { useState, useMemo, useEffect, useRef } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from 'tldraw'
import 'tldraw/tldraw.css'
import { AIPanel } from './ai/AIPanel'
import './ai/AIPanel.css'

const STORAGE_KEY = 'taopipi-canvas-v1'

function App() {
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [ready, setReady] = useState(false)
  const saveTimerRef = useRef(null)

  const store = useMemo(() => {
    const s = createTLStore({ shapeUtils: defaultShapeUtils })

    // 从 localStorage 恢复画布数据
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const snapshot = JSON.parse(saved)
        if (snapshot.store && snapshot.schema) {
          s.loadStoreSnapshot(snapshot)
          console.log('画布数据已恢复')
        }
      }
    } catch (e) {
      console.error('读取画布数据失败', e)
    }

    return s
  }, [])

  // 自动保存到 localStorage（带防抖，等 Tldraw 组件挂载完毕）
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!ready) return

    const cleanup = store.listen(() => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        try {
          const snapshot = store.getStoreSnapshot()
          localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
        } catch (e) {
          console.error('保存画布数据失败', e)
        }
      }, 300)
    })
    return () => {
      cleanup()
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [store, ready])

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw store={store} />

      {/* AI 助手按钮 - 左上角 */}
      <button
        onClick={() => setShowAIPanel(!showAIPanel)}
        style={{
          position: 'fixed',
          top: '80px',
          left: '16px',
          padding: '10px 16px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          zIndex: 999,
          fontSize: '14px',
          fontWeight: 600,
          color: 'white',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        🤖 AI 助手
      </button>

      {/* AI 面板 */}
      {showAIPanel && <AIPanel onClose={() => setShowAIPanel(false)} />}
    </div>
  )
}

export default App
