import { loadApiKeys, loadModelParameters } from './storage';
import { claudeModels, CLAUDE_API_URL } from '../constants';

/**
 * Sends messages to the Claude API and handles streaming responses.
 *
 * @param {Array<object>} messages - The conversation history.
 * @param {string} model - The Claude model ID to use.
 * @param {Function} onChunk - Callback function to handle incoming stream chunks. It receives (chunkText).
 * @param {Function} onComplete - Callback function when the stream is finished. It receives (finalData).
 * @param {Function} onError - Callback function for errors during streaming. It receives (error).
 */
export const sendClaudeMessageStream = async (messages, model, onChunk, onComplete, onError) => {
    let apiKey;
    let parameters;
    try {
        const keys = await loadApiKeys();
        apiKey = keys.claude;
        parameters = await loadModelParameters();
    } catch (error) {
        onError(new Error("Failed to load API keys or parameters."));
        return;
    }


    if (!apiKey) {
        onError(new Error('Claude API key not found. Please add it in the settings.'));
        return;
    }

    const modelInfo = claudeModels.find(m => m.id === model);
    const supportsImages = modelInfo?.supportsImages || false;

    let systemPrompt = parameters.claude.system_prompt || '';
    let formattedMessages = [];

    messages.forEach(msg => {
        if (msg.role === 'system') {
            systemPrompt += (systemPrompt ? '\n' : '') + msg.content;
        } else {
            if (supportsImages && msg.image && msg.role === 'user') {
                const mimeTypeMatch = msg.image.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,/);
                const media_type = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

                formattedMessages.push({
                    role: msg.role,
                    content: [
                        { type: 'text', text: msg.content },
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: media_type,
                                data: msg.image.split(',')[1]
                            }
                        }
                    ]
                });
            } else {
                formattedMessages.push({
                    role: msg.role,
                    content: msg.content + (msg.image && !supportsImages ? "\n[Image attached, but this model version doesn't support images]" : "")
                });
            }
        }
    });

    const body = {
        model: model,
        messages: formattedMessages,
        max_tokens: parameters.claude.max_tokens,
        temperature: parameters.claude.temperature,
        top_p: parameters.claude.top_p,
        top_k: parameters.claude.top_k,
        stream: true,
    };

    if (systemPrompt) {
        body.system = systemPrompt;
    }

    try {
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'messages-streaming-2024-07-11'
            },
            body: JSON.stringify(body)
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

            let eolIndex;
            while ((eolIndex = buffer.indexOf('\n')) >= 0) {
                const line = buffer.substring(0, eolIndex).trim();
                buffer = buffer.substring(eolIndex + 1);

                if (line.startsWith('event: ')) {
                    const eventType = line.substring(7).trim();
                } else if (line.startsWith('data: ')) {
                    const dataContent = line.substring(6).trim();
                    try {
                        const json = JSON.parse(dataContent);

                        switch (json.type) {
                            case 'message_start':
                                // Extract initial message info if needed (like ID, model, usage)
                                if (json.message?.usage) {
                                    finalData.tokenUsage = {
                                        prompt: json.message.usage.input_tokens,
                                        completion: 0,
                                        total: json.message.usage.input_tokens
                                    };
                                }
                                if (json.message?.model) {
                                    finalData.model = json.message.model;
                                }
                                break;
                            case 'content_block_delta':
                                if (json.delta?.type === 'text_delta') {
                                    onChunk(json.delta.text);
                                }
                                break;
                            case 'message_delta':
                                if (json.usage?.output_tokens) {
                                    finalData.tokenUsage.completion = json.usage.output_tokens;
                                    finalData.tokenUsage.total = (finalData.tokenUsage.prompt || 0) + json.usage.output_tokens;
                                }
                                break;
                            case 'message_stop':
                                break;
                            case 'ping':
                                break;
                            case 'error':
                                console.error("Claude stream error:", json.error);
                                onError(new Error(json.error?.message || "Unknown stream error"));
                                return;
                            default:
                                console.warn("Unhandled Claude stream event type:", json.type, json);
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse Claude stream chunk JSON:', parseError, 'Chunk:', dataContent);
                    }
                }
            }
        }
        if (buffer.trim()) {
            console.warn("Non-empty buffer remaining after Claude stream:", buffer);
        }

        onComplete(finalData);

    } catch (error) {
        console.error('Claude API streaming error:', error);
        onError(error);
    }
};