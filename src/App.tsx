import { useState, useMemo, useEffect } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils, getSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { AIPanel } from './ai/AIPanel'
import './ai/AIPanel.css'

const STORAGE_KEY = 'taopipi-canvas-v1'

function App() {
  const [showAIPanel, setShowAIPanel] = useState(false)

  const store = useMemo(() => {
    let snapshot
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        snapshot = JSON.parse(saved)
        console.log('画布数据已恢复')
      }
    } catch (e) {
      console.error('读取画布数据失败', e)
    }

    return createTLStore({
      shapeUtils: defaultShapeUtils,
      ...(snapshot ? { snapshot } : {}),
    })
  }, [])

  // 自动保存到 localStorage
  useEffect(() => {
    const cleanup = store.listen(() => {
      try {
        const snapshot = getSnapshot(store)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
      } catch (e) {
        console.error('保存画布数据失败', e)
      }
    })
    return cleanup
  }, [store])

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
