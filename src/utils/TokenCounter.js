import { getEncoding } from "tiktoken/lite/init";
import cl100k_base from "tiktoken/encoders/cl100k_base.json";

// Simple fallback tokenizer
const fallbackEstimate = (text) => {
    if (!text) return 0;
    // Very rough estimate: ~4 chars per token for English text
    return Math.ceil(text.length / 4);
};

let encoding;

// Asynchronously initialize the tokenizer
const initializeEncoding = async () => {
    if (!encoding) {
        try {
            const model = await cl100k_base;
            encoding = await getEncoding(model.name);
        } catch (error) {
            console.error("Failed to initialize tiktoken encoding:", error);
            encoding = null;
        }
    }
    return encoding;
};

initializeEncoding();

/**
 * Estimates token count using tiktoken for OpenAI models, falls back to simple estimate.
 * @param {string} text The text to count tokens for.
 * @returns {Promise<number>} Estimated token count.
 */
export const estimateTokenCount = async (text) => {
    if (!text) return 0;

    const currentEncoding = await initializeEncoding();

    if (currentEncoding) {
        try {
            const tokens = currentEncoding.encode(text);
            return tokens.length;
        } catch (error) {
            console.warn("Tiktoken encoding failed, falling back to estimate:", error);
            return fallbackEstimate(text);
        }
    } else {
        return fallbackEstimate(text);
    }
};

/**
 * Formats a date timestamp into a locale-specific time string.
 * @param {string | Date} timestamp - The ISO string or Date object.
 * @returns {string} Formatted time string (e.g., "10:35 AM").
 */
export const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
        console.error("Failed to format timestamp:", e);
        return '';
    }
};