// Simple fallback tokenizer
const fallbackEstimate = (text) => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
};
export const estimateTokenCount = async (text) => {
    //console.warn("Using fallback token estimation due to init error.");
    return fallbackEstimate(text);
};

/*
let encoding;

// Asynchronously initialize the tokenizer
const initializeEncoding = async () => {
    if (!encoding) {
        console.log("Attempting to initialize tiktoken...");
        try {
            const model = await cl100k_base;
            console.log("Tiktoken model data:", model); // Check model data
            if (!model || !model.name) {
                console.error("Model data or model.name is missing!");
                throw new Error("Model data or model.name is missing!");
            }
            console.log("Using model name:", model.name);
            // Make sure get_encoding is actually imported if it's not global
            // import { get_encoding } from "tiktoken"; might be needed at top level? (already there)
            encoding = await get_encoding(model.name);
            console.log("Tiktoken encoding initialized successfully.");
        } catch (error) {
            console.error("Failed to initialize tiktoken encoding:", error); // Log the specific error
            encoding = null; // Keep this
        }
    }
    return encoding;
};

initializeEncoding();

/!**
 * Estimates token count using tiktoken for OpenAI models, falls back to simple estimate.
 * @param {string} text The text to count tokens for.
 * @returns {Promise<number>} Estimated token count.
 *!/
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
*/

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