export const estimateTokenCount = (text) => {
    if (!text) return 0;
    // Approximate tokenization - English text is roughly 4 chars per token
    return Math.ceil(text.length / 4);
};