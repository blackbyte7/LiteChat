import { loadApiKeys } from './storage';

export const openaiModels = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', tokenLimit: 4096 },
    { id: 'gpt-4', name: 'GPT-4', tokenLimit: 8192 },
    { id: 'gpt-4-vision-preview', name: 'GPT-4 Vision', tokenLimit: 128000, supportsImages: true }
];

export const sendOpenAIMessage = async (messages, model = 'gpt-3.5-turbo') => {
    const keys = await loadApiKeys();
    const apiKey = keys.openai;

    if (!apiKey) {
        throw new Error('OpenAI API key not found. Please add it in the settings.');
    }

    const supportsImages = openaiModels.find(m => m.id === model)?.supportsImages || false;

    // Format messages for OpenAI API
    const formattedMessages = messages.map(msg => {
        if (!msg.image) {
            return {
                role: msg.role,
                content: msg.content
            };
        }

        if (supportsImages && msg.image) {
            return {
                role: msg.role,
                content: [
                    { type: 'text', text: msg.content },
                    {
                        type: 'image_url',
                        image_url: {
                            url: msg.image,
                            detail: 'auto'
                        }
                    }
                ]
            };
        }

        return {
            role: msg.role,
            content: msg.content + " [Image was attached but this model doesn't support images]"
        };
    });

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: formattedMessages,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to get response from OpenAI');
        }

        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            role: 'assistant',
            provider: 'openai',
            model: model,
            timestamp: new Date().toISOString(),
            tokenUsage: {
                prompt: data.usage.prompt_tokens,
                completion: data.usage.completion_tokens,
                total: data.usage.total_tokens
            }
        };
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
    }
};