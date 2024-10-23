import { loadApiKeys } from './storage';

export const geminiModels = [
    { id: 'gemini-pro', name: 'Gemini Pro', tokenLimit: 30000 },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', tokenLimit: 12000, supportsImages: true }
];

export const sendGeminiMessage = async (messages, model = 'gemini-pro') => {
    const keys = await loadApiKeys();
    const apiKey = keys.gemini;

    if (!apiKey) {
        throw new Error('Gemini API key not found. Please add it in the settings.');
    }

    const supportsImages = geminiModels.find(m => m.id === model)?.supportsImages || false;

    // Format conversation history for Gemini API
    let formattedMessages = [];
    let systemPrompt = '';

    messages.forEach(msg => {
        if (msg.role === 'system') {
            systemPrompt += msg.content + '\n';
            return;
        }

        // Mapping roles to Gemini format
        const role = msg.role === 'assistant' ? 'model' : 'user';

        // Handle images for vision model
        if (supportsImages && msg.image && role === 'user') {
            formattedMessages.push({
                role: role,
                parts: [
                    { text: msg.content },
                    { inline_data: {
                            mime_type: msg.image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
                            data: msg.image.split(',')[1]
                        }
                    }
                ]
            });
        } else {
            formattedMessages.push({
                role: role,
                parts: [{ text: msg.content }]
            });
        }
    });

    // Add system prompt as a preamble for the first user message if it exists
    if (systemPrompt && formattedMessages.length > 0) {
        const firstUserIndex = formattedMessages.findIndex(msg => msg.role === 'user');
        if (firstUserIndex >= 0) {
            const firstUserMessage = formattedMessages[firstUserIndex];
            formattedMessages[firstUserIndex] = {
                ...firstUserMessage,
                parts: [{ text: `${systemPrompt}\n\n${firstUserMessage.parts[0].text}` },
                    ...(firstUserMessage.parts.slice(1))]
            };
        }
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: formattedMessages,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to get response from Gemini');
        }

        const data = await response.json();

        return {
            content: data.candidates[0].content.parts[0].text,
            role: 'assistant',
            provider: 'gemini',
            model: model,
            timestamp: new Date().toISOString(),
            tokenUsage: {
                total: data.usageMetadata?.totalTokenCount || 0,
                prompt: data.usageMetadata?.promptTokenCount || 0,
                completion: data.usageMetadata?.candidatesTokenCount || 0
            }
        };
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
};