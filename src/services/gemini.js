import { loadApiKeys, loadModelParameters } from './storage';
import { geminiModels, GEMINI_API_BASE_URL } from '../constants';

/**
 * Sends messages to the Gemini API and handles streaming responses.
 *
 * @param {Array<object>} messages - The conversation history.
 * @param {string} model - The Gemini model ID to use.
 * @param {Function} onChunk - Callback function to handle incoming stream chunks. It receives (chunkText).
 * @param {Function} onComplete - Callback function when the stream is finished. It receives (finalData).
 * @param {Function} onError - Callback function for errors during streaming. It receives (error).
 */
export const sendGeminiMessageStream = async (messages, model, onChunk, onComplete, onError) => {
    let apiKey;
    let parameters;
    try {
        const keys = await loadApiKeys();
        apiKey = keys.gemini;
        parameters = await loadModelParameters();
    } catch (error) {
        onError(new Error("Failed to load API keys or parameters."));
        return;
    }

    if (!apiKey) {
        onError(new Error('Gemini API key not found. Please add it in the settings.'));
        return;
    }

    const modelInfo = geminiModels.find(m => m.id === model);
    const supportsImages = modelInfo?.supportsImages || false;

    let formattedMessages = [];
    let systemInstructions = [];

    messages.forEach(msg => {
        if (msg.role === 'system') {
            systemInstructions.push({ parts: [{ text: msg.content }] });
            return;
        }

        const role = msg.role === 'assistant' ? 'model' : 'user';
        let parts = [];

        if (msg.content) {
            parts.push({ text: msg.content });
        }

        if (supportsImages && msg.image && role === 'user') {
            const mimeTypeMatch = msg.image.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,/);
            const mime_type = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

            parts.push({
                inline_data: {
                    mime_type: mime_type,
                    data: msg.image.split(',')[1]
                }
            });
        } else if (msg.image && !supportsImages) {
            if (parts.length > 0 && parts[0].text) {
                parts[0].text += "\n[Image attached, but this model version doesn't support images]";
            } else {
                parts.push({ text: "[Image attached, but this model version doesn't support images]" });
            }
        }
        if (parts.length > 0) {
            formattedMessages.push({ role: role, parts: parts });
        }
    });

    // Gemini requires alternating user/model roles, starting with user.
    let filteredMessages = [];
    let lastRole = null;
    formattedMessages.forEach(msg => {
        if (filteredMessages.length === 0 && msg.role !== 'user') {
            return;
        }
        if (msg.role !== lastRole) {
            filteredMessages.push(msg);
            lastRole = msg.role;
        } else {
            console.warn(`Skipping consecutive message from role: ${msg.role}`);
            // filteredMessages[filteredMessages.length - 1] = msg;
        }
    });

    // Ensure the last message is from 'user' for the API call
    if (filteredMessages.length > 0 && filteredMessages[filteredMessages.length - 1].role !== 'user') {
        console.warn("Last message not from user, potentially removing assistant's final response from history for API call.");
        // filteredMessages.pop();
    }


    const body = {
        contents: filteredMessages,
        generationConfig: {
            temperature: parameters.gemini.temperature,
            maxOutputTokens: parameters.gemini.max_output_tokens,
            // topP: parameters.gemini.topP,
            // topK: parameters.gemini.topK,
        },
        ...(systemInstructions.length > 0 && { systemInstruction: systemInstructions[0] })
    };

    const apiUrl = `${GEMINI_API_BASE_URL}${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `API request failed with status ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error?.message || errorMessage;
            } catch {
                errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`;
            }
            throw new Error(errorMessage);
        }

        // Process Gemini SSE stream
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

                if (line.startsWith('data: ')) {
                    const dataContent = line.substring(6).trim();
                    try {
                        const json = JSON.parse(dataContent);

                        const textChunk = json.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (textChunk) {
                            onChunk(textChunk);
                        }

                        if (json.usageMetadata) {
                            finalData.tokenUsage = {
                                prompt: json.usageMetadata.promptTokenCount,
                                completion: json.usageMetadata.candidatesTokenCount,
                                total: json.usageMetadata.totalTokenCount,
                            };
                        }

                    } catch (parseError) {
                        console.warn('Failed to parse Gemini stream chunk JSON:', parseError, 'Chunk:', dataContent);
                    }
                }
            }
        }
        if (buffer.trim()) {
            console.warn("Non-empty buffer remaining after Gemini stream:", buffer);
        }
        onComplete(finalData);
    } catch (error) {
        console.error('Gemini API streaming error:', error);
        onError(error);
    }
};