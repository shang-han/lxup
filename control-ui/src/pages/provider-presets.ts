/**
 * 常用模型服务商预设（模型配置页 / Codex 配置页共用）
 * key=稳定标识；labelKey=本地化显示名；baseUrl=OpenAI 兼容接口基址（空=无公开端点）。
 */
/** key=稳定标识（选中态比较/无 labelKey 时即显示名）；labelKey=本地化显示名（自动填充也用本地化名）。
 *  专属名称用官方英文品牌：Volcano Engine / Zhipu AI / Alibaba Cloud Model Studio。 */
export const PROVIDER_PRESETS = [
  { key: 'relay', labelKey: 'presetRelay', baseUrl: '', models: ['gpt-4o', 'claude-sonnet-4-5'] },
  { key: 'volcengine', labelKey: 'presetVolcengine', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', models: ['doubao-1-5-pro-32k', 'deepseek-v3-250324'] },
  { key: 'volcengine-coding', labelKey: 'presetVolcengineCoding', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', models: ['doubao-seed-code-preview-251028'] },
  { key: 'bailian', labelKey: 'presetBailian', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-max', 'qwen-plus', 'qwen-turbo'] },
  { key: 'zhipu', labelKey: 'presetZhipu', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-4-plus', 'glm-4-flash'] },
  { key: 'MiniMax', baseUrl: 'https://api.minimax.chat/v1', models: ['MiniMax-Text-01'] },
  { key: 'Moonshot / Kimi', baseUrl: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k'] },
  { key: 'openai-official', labelKey: 'presetOpenAIOfficial', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'] },
  { key: 'anthropic-official', labelKey: 'presetAnthropicOfficial', baseUrl: 'https://api.anthropic.com', models: ['claude-sonnet-4-5', 'claude-opus-4-1'] },
  { key: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { key: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', models: ['gemini-2.0-flash', 'gemini-1.5-pro'] },
  { key: 'xAI (Grok)', baseUrl: 'https://api.x.ai/v1', models: ['grok-3', 'grok-3-mini'] },
  { key: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile'] },
  { key: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', models: ['anthropic/claude-sonnet-4', 'openai/gpt-4o'] },
  { key: 'NVIDIA NIM', baseUrl: 'https://integrate.api.nvidia.com/v1', models: ['meta/llama-3.1-70b-instruct'] },
  { key: 'ollama-local', labelKey: 'presetOllamaLocal', baseUrl: 'http://127.0.0.1:11434/v1', models: ['llama3.1', 'qwen2.5'] },
];
