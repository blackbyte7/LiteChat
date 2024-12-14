export const openaiModels = [
    { id: 'gpt-4o', name: 'GPT-4o', tokenLimit: 128000, supportsImages: true },
    { id: 'gpt-4o-mini-2024-07-18', name: 'GPT-4o mini', tokenLimit: 128000, supportsImages: true },
    { id: 'o3-mini', name: 'o3 Mini', tokenLimit: 128000, supportsImages: true }
];

export const claudeModels = [
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', tokenLimit: 200000, supportsImages: true },
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet', tokenLimit: 200000, supportsImages: true },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', tokenLimit: 200000, supportsImages: true },
    { id: 'claude-3-7-sonnet-latest', name: 'Claude 3.7 Sonnet', tokenLimit: 180000, supportsImages: true }
];

export const geminiModels = [
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', tokenLimit: 1048576, supportsImages: true },
    { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', tokenLimit: 1048576, supportsImages: true },
    { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro', tokenLimit: 30000, supportsImages: true },
];

// API Base URLs
export const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
export const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

// Storage Keys
export const STORAGE_KEY_API_KEYS = 'apiKeys';
export const STORAGE_KEY_MODEL_PARAMS = 'modelParameters';
export const STORAGE_KEY_CHAT_HISTORY = 'chatHistory';
export const STORAGE_KEY_DARK_MODE = 'darkMode';

export const DEFAULT_MODEL_PARAMETERS = {
    openai: {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    },
    claude: {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        top_k: 50,
        system_prompt: ''
    },
    gemini: {
        temperature: 0.7,
        max_output_tokens: 8192
    }
};