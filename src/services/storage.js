/* global chrome */

import {
    STORAGE_KEY_CHAT_HISTORY,
    STORAGE_KEY_API_KEYS,
    STORAGE_KEY_MODEL_PARAMS,
    DEFAULT_MODEL_PARAMETERS
} from '../constants';

// Helper for Chrome Storage API Promises
const storageGet = (key, storageArea = 'local') => {
    return new Promise((resolve, reject) => {
        chrome.storage[storageArea].get(key, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[key]);
            }
        });
    });
};

const storageSet = (data, storageArea = 'local') => {
    return new Promise((resolve, reject) => {
        chrome.storage[storageArea].set(data, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
};

//Chat History (Local Storage)

export const saveChatHistory = async (chatHistory) => {
    try {
        if (!Array.isArray(chatHistory)) {
            throw new Error("Invalid chat history format: Must be an array.");
        }
        await storageSet({ [STORAGE_KEY_CHAT_HISTORY]: chatHistory }, 'local');
    } catch (error) {
        console.error("Error saving chat history:", error);
    }
};

export const loadChatHistory = async () => {
    try {
        const history = await storageGet(STORAGE_KEY_CHAT_HISTORY, 'local');
        return Array.isArray(history) ? history : [];
    } catch (error) {
        console.error("Error loading chat history:", error);
        return [];
    }
};

// API Keys (Sync Storage)

export const saveApiKeys = async (keys) => {
    try {
        if (typeof keys !== 'object' || keys === null) {
            throw new Error("Invalid API keys format: Must be an object.");
        }
        await storageSet({ [STORAGE_KEY_API_KEYS]: keys }, 'sync');
    } catch (error) {
        console.error("Error saving API keys:", error);
    }
};

export const loadApiKeys = async () => {
    try {
        const keys = await storageGet(STORAGE_KEY_API_KEYS, 'sync');
        const defaultKeys = { openai: '', claude: '', gemini: '' };
        if (typeof keys === 'object' && keys !== null) {
            return {
                openai: keys.openai || '',
                claude: keys.claude || '',
                gemini: keys.gemini || ''
            };
        }
        return defaultKeys;
    } catch (error) {
        console.error("Error loading API keys:", error);
        return { openai: '', claude: '', gemini: '' };
    }
};

export const saveModelParameters = async (parameters) => {
    try {
        if (typeof parameters !== 'object' || parameters === null) {
            throw new Error("Invalid model parameters format: Must be an object.");
        }
        await storageSet({ [STORAGE_KEY_MODEL_PARAMS]: parameters }, 'sync');
    } catch (error) {
        console.error("Error saving model parameters:", error);
    }
};

export const loadModelParameters = async () => {
    try {
        const params = await storageGet(STORAGE_KEY_MODEL_PARAMS, 'sync');
        if (typeof params === 'object' && params !== null) {
            return {
                openai: { ...DEFAULT_MODEL_PARAMETERS.openai, ...(params.openai || {}) },
                claude: { ...DEFAULT_MODEL_PARAMETERS.claude, ...(params.claude || {}) },
                gemini: { ...DEFAULT_MODEL_PARAMETERS.gemini, ...(params.gemini || {}) },
            };
        }
        return DEFAULT_MODEL_PARAMETERS;
    } catch (error) {
        console.error("Error loading model parameters:", error);
        return DEFAULT_MODEL_PARAMETERS;
    }
};