import { useState, useRef, useEffect } from 'react';
import { AIModel, MODELS, getModelPlatform } from './models';
import { Message, callAI, generateId, loadAIConfig, saveAIConfig } from './api';
import './AIPanel.css';

interface AIPanelProps {
  onClose: () => void;
}

export function AIPanel({ onClose }: AIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // API Key 设置
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    openai: localStorage.getItem('ai-openai-key') || '',
    anthropic: localStorage.getItem('ai-anthropic-key') || '',
    zhipu: localStorage.getItem('ai-zhipu-key') || '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSettings = () => {
    localStorage.setItem('ai-openai-key', settings.openai);
    localStorage.setItem('ai-anthropic-key', settings.anthropic);
    localStorage.setItem('ai-zhipu-key', settings.zhipu);
    
    // 同时保存到 ai-config
    saveAIConfig({
      openai: { apiKey: settings.openai },
      anthropic: { apiKey: settings.anthropic },
      zhipu: { apiKey: settings.zhipu },
    });
    
    setShowSettings(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const platform = getModelPlatform(selectedModel);
      const config = loadAIConfig();
      
      // 检查是否有 API Key
      const hasKey = {
        openai: !!config.openai?.apiKey || !!settings.openai,
        anthropic: !!config.anthropic?.apiKey || !!settings.anthropic,
        zhipu: !!config.zhipu?.apiKey || !!settings.zhipu,
      };

      if (!hasKey[platform]) {
        throw new Error(`请先配置 ${platform === 'openai' ? 'OpenAI' : platform === 'anthropic' ? 'Anthropic' : '智谱'} API Key`);
      }

      const reply = await callAI(selectedModel, [...messages, userMessage]);

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <span className="ai-icon">🤖</span>
          <span>AI 助手</span>
        </div>
        <div className="ai-panel-actions">
          <button className="ai-btn ai-btn-icon" onClick={clearChat} title="清空聊天">
            🗑️
          </button>
          <button className="ai-btn ai-btn-icon" onClick={() => setShowSettings(!showSettings)} title="API 设置">
            ⚙️
          </button>
          <button className="ai-btn ai-btn-icon" onClick={onClose} title="关闭">
            ✕
          </button>
        </div>
      </div>

      {/* API 设置面板 */}
      {showSettings && (
        <div className="ai-settings">
          <div className="ai-settings-title">API Key 配置</div>
          
          <div className="ai-settings-group">
            <label>OpenAI API Key</label>
            <input
              type="password"
              value={settings.openai}
              onChange={e => setSettings(s => ({ ...s, openai: e.target.value }))}
              placeholder="sk-..."
            />
          </div>
          
          <div className="ai-settings-group">
            <label>Anthropic API Key</label>
            <input
              type="password"
              value={settings.anthropic}
              onChange={e => setSettings(s => ({ ...s, anthropic: e.target.value }))}
              placeholder="sk-ant-..."
            />
          </div>
          
          <div className="ai-settings-group">
            <label>智谱 API Key</label>
            <input
              type="password"
              value={settings.zhipu}
              onChange={e => setSettings(s => ({ ...s, zhipu: e.target.value }))}
              placeholder="..."
            />
          </div>
          
          <button className="ai-btn ai-btn-primary" onClick={saveSettings}>
            保存配置
          </button>
        </div>
      )}

      {/* 模型选择 */}
      <div className="ai-model-selector">
        {MODELS.map(model => (
          <button
            key={model.id}
            className={`ai-model-btn ${selectedModel === model.id ? 'active' : ''}`}
            onClick={() => setSelectedModel(model.id)}
          >
            {model.name}
          </button>
        ))}
      </div>

      {/* 消息列表 */}
      <div className="ai-messages">
        {messages.length === 0 && !error && (
          <div className="ai-empty">
            <p>👋 你好！我是 AI 助手</p>
            <p>请先在上方选择模型并配置 API Key</p>
          </div>
        )}
        
        {error && (
          <div className="ai-error">{error}</div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`ai-message ${msg.role}`}>
            <div className="ai-message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="ai-message-content">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-message assistant">
            <div className="ai-message-avatar">🤖</div>
            <div className="ai-message-content">
              <span className="ai-loading">思考中...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="ai-input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息，按 Enter 发送..."
          rows={2}
        />
        <button 
          className="ai-btn ai-btn-send" 
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          发送
        </button>
      </div>
    </div>
  );
}
