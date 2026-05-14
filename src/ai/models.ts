// 支持的 AI 模型
export type AIModel = 
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-3-5-sonnet'
  | 'claude-3-7-sonnet'
  | 'glm-4'
  | 'glm-4v';

export interface ModelInfo {
  id: AIModel;
  name: string;
  platform: 'openai' | 'anthropic' | 'zhipu';
  vision?: boolean; // 是否支持图片
}

export const MODELS: ModelInfo[] = [
  { id: 'gpt-4o', name: 'GPT-4o', platform: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', platform: 'openai' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', platform: 'anthropic' },
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', platform: 'anthropic' },
  { id: 'glm-4', name: 'GLM-4', platform: 'zhipu' },
  { id: 'glm-4v', name: 'GLM-4V', platform: 'zhipu', vision: true },
];

export function getModelPlatform(model: AIModel): 'openai' | 'anthropic' | 'zhipu' {
  return MODELS.find(m => m.id === model)?.platform || 'openai';
}
