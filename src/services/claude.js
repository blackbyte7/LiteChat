// src/services/claude.js
import { loadApiKeys, loadModelParameters } from './storage';

export const claudeModels = [
    { id: 'claude-3-opus-latest', name: 'Claude 3 Opus', tokenLimit: 100000 },
    { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet', tokenLimit: 100000, supportsImages: true  },
    { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku', tokenLimit: 200000, supportsImages: true },
    { id: 'claude-3-7-sonnet-latest', name: 'Claude 3.7 Sonnet', tokenLimit: 180000, supportsImages: true }
];

export const sendClaudeMessage = async (messages, model = 'claude-3-5-sonnet-latest') => {
    const keys = await loadApiKeys();
    const apiKey = keys.claude;
    const parameters = await loadModelParameters();

    if (!apiKey) {
        throw new Error('Claude API key not found. Please add it in the settings.');
    }

    const supportsImages = claudeModels.find(m => m.id === model)?.supportsImages || false;

    // Format conversation history for Claude API
    let systemPrompt = parameters.claude.system_prompt || '';
    let formattedMessages = [];

    messages.forEach(msg => {
        if (msg.role === 'system') {
            systemPrompt += (systemPrompt ? '\n' : '') + msg.content;
        } else {
            // Handle image attachments for Claude 3
            if (supportsImages && msg.image && msg.role === 'user') {
                formattedMessages.push({
                    role: msg.role,
                    content: [
                        {
                            type: 'text',
                            text: msg.content
                        },
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: msg.image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
                                data: msg.image.split(',')[1]
                            }
                        }
                    ]
                });
            } else {
                formattedMessages.push({
                    role: msg.role,
                    content: msg.content
                });
            }
        }
    });

    // Add system prompt if it exists
    if (systemPrompt) {
        formattedMessages.unshift({
            role: 'system',
            content: systemPrompt
        });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                messages: formattedMessages,
                max_tokens: parameters.claude.max_tokens,
                temperature: parameters.claude.temperature,
                top_p: parameters.claude.top_p,
                top_k: parameters.claude.top_k
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to get response from Claude');
        }

        const data = await response.json();
        return {
            content: data.content[0].text,
            role: 'assistant',
            provider: 'claude',
            model: model,
            timestamp: new Date().toISOString(),
            tokenUsage: {
                prompt: data.usage?.input_tokens || 0,
                completion: data.usage?.output_tokens || 0,
                total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
            }
        };
    } catch (error) {
        console.error('Claude API error:', error);
        throw error;
    }
};