/* global chrome */

export const saveChatHistory = async (chatHistory) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ chatHistory }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
};

export const loadChatHistory = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('chatHistory', (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.chatHistory || []);
            }
        });
    });
};

export const saveApiKeys = async (keys) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ apiKeys: keys }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
};

export const loadApiKeys = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('apiKeys', (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.apiKeys || { openai: '', claude: '', gemini: '' });
            }
        });
    });
};

export const saveModelParameters = async (parameters) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ modelParameters: parameters }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
};

export const loadModelParameters = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('modelParameters', (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                // Default parameters if none exist
                const defaultParameters = {
                    openai: {
                        temperature: 0.7,
                        max_tokens: 2048,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0
                    },
                    claude: {
                        temperature: 0.7,
                        max_tokens: 4000,
                        top_p: 1,
                        top_k: 50,
                        system_prompt: ''
                    },
                    gemini: {
                        temperature: 0.7,
                        max_output_tokens: 2048
                    }
                };
                resolve(result.modelParameters || defaultParameters);
            }
        });
    });
};