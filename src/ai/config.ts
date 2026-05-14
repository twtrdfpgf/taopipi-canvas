// AI 平台配置
export interface AIConfig {
  openai?: {
    apiKey: string;
    baseUrl?: string;
  };
  anthropic?: {
    apiKey: string;
  };
  zhipu?: {
    apiKey: string;
  };
}

// 加载配置
export function loadAIConfig(): AIConfig {
  const saved = localStorage.getItem('ai-config');
  return saved ? JSON.parse(saved) : {};
}

// 保存配置
export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem('ai-config', JSON.stringify(config));
}

// 获取某个平台的配置状态
export function hasAPIKey(platform: 'openai' | 'anthropic' | 'zhipu'): boolean {
  const config = loadAIConfig();
  return !!(config[platform]?.apiKey);
}
