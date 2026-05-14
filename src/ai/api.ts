import { AIModel } from './models';
import { loadAIConfig } from './config';
export { loadAIConfig, saveAIConfig } from './config';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// 调用 OpenAI API
async function callOpenAI(model: AIModel, messages: Message[], apiKey?: string, baseUrl?: string): Promise<string> {
  if (!apiKey) throw new Error('请先配置 OpenAI API Key');

  const endpoint = baseUrl || 'https://api.openai.com/v1';
  
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API 错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// 调用 Anthropic API
async function callAnthropic(model: AIModel, messages: Message[], apiKey?: string): Promise<string> {
  if (!apiKey) throw new Error('请先配置 Anthropic API Key');

  const modelMap: Record<string, string> = {
    'claude-3-5-sonnet': 'claude-sonnet-4-20250514',
    'claude-3-7-sonnet': 'claude-sonnet-4-20250514',
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelMap[model] || model,
      max_tokens: 4096,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API 错误: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

// 调用智谱 GLM API
async function callZhipu(model: AIModel, messages: Message[], apiKey?: string): Promise<string> {
  if (!apiKey) throw new Error('请先配置智谱 API Key');

  const modelMap: Record<string, string> = {
    'glm-4': 'glm-4',
    'glm-4v': 'glm-4v',
  };

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelMap[model] || 'glm-4',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `智谱 API 错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// 主调用函数
export async function callAI(model: AIModel, messages: Message[]): Promise<string> {
  const config = loadAIConfig();
  const platform = model.startsWith('claude') ? 'anthropic' : model.startsWith('glm') ? 'zhipu' : 'openai';

  switch (platform) {
    case 'anthropic':
      return callAnthropic(model, messages, config.anthropic?.apiKey);
    case 'zhipu':
      return callZhipu(model, messages, config.zhipu?.apiKey);
    default:
      return callOpenAI(model, messages, config.openai?.apiKey, config.openai?.baseUrl);
  }
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
