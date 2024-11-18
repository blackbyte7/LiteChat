import { loadApiKeys, loadModelParameters } from './storage';
import { openaiModels, OPENAI_API_URL } from '../constants';

/**
 * Sends messages to the OpenAI API and handles streaming responses.
 *
 * @param {Array<object>} messages - The conversation history.
 * @param {string} model - The OpenAI model ID to use.
 * @param {Function} onChunk - Callback function to handle incoming stream chunks. It receives (chunkText).
 * @param {Function} onComplete - Callback function when the stream is finished. It receives (finalData).
 * @param {Function} onError - Callback function for errors during streaming. It receives (error).
 */
export const sendOpenAIMessageStream = async (messages, model, onChunk, onComplete, onError) => {
    let apiKey;
    let parameters;
    try {
        const keys = await loadApiKeys();
        apiKey = keys.openai;
        parameters = await loadModelParameters();
    } catch (error) {
        onError(new Error("Failed to load API keys or parameters."));
        return;
    }

    if (!apiKey) {
        onError(new Error('OpenAI API key not found. Please add it in the settings.'));
        return;
    }

    const modelInfo = openaiModels.find(m => m.id === model);
    const supportsImages = modelInfo?.supportsImages || false;

    const formattedMessages = messages.map(msg => {
        if (msg.role === 'system') {
            return { role: 'system', content: msg.content };
        }
        if (!msg.image || !supportsImages) {
            let content = msg.content;
            if (msg.image && !supportsImages) {
                content += "\n[Image attached, but this model version doesn't support images]";
            }
            return { role: msg.role, content: content };
        }

        // assuming msg.image is base64 data URL
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
    }).filter(Boolean); // Filter out potentially empty messages if logic changes

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: formattedMessages,
                temperature: parameters.openai.temperature,
                max_tokens: parameters.openai.max_tokens,
                top_p: parameters.openai.top_p,
                frequency_penalty: parameters.openai.frequency_penalty,
                presence_penalty: parameters.openai.presence_penalty,
                stream: true,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: { message: `HTTP Error: ${response.status} ${response.statusText}` }
            }));
            throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalData = { tokenUsage: {}, model: model };

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            let lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataContent = line.substring(6).trim();
                    if (dataContent === '[DONE]') {
                        break;
                    }
                    try {
                        const json = JSON.parse(dataContent);
                        const delta = json.choices?.[0]?.delta?.content;
                        if (delta) {
                            onChunk(delta);
                        }
                        if (json.usage) {
                            finalData.tokenUsage = {
                                prompt: json.usage.prompt_tokens,
                                completion: json.usage.completion_tokens,
                                total: json.usage.total_tokens,
                            };
                        }
                        if (json.model) {
                            finalData.model = json.model;
                        }

                    } catch (parseError) {
                        console.warn('Failed to parse stream chunk JSON:', parseError, 'Chunk:', dataContent);
                    }
                }
            }
        }
        buffer += decoder.decode();
        if (buffer.trim()) {
            console.warn("Non-empty buffer remaining after stream:", buffer);
        }
        onComplete(finalData);

    } catch (error) {
        console.error('OpenAI API streaming error:', error);
        onError(error);
    }
};