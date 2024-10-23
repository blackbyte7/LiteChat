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