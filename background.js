/* global chrome */

import {
    STORAGE_KEY_API_KEYS,
    STORAGE_KEY_MODEL_PARAMS,
    STORAGE_KEY_DARK_MODE,
    DEFAULT_MODEL_PARAMETERS
} from './src/constants.js'; // Use constants

chrome.runtime.onInstalled.addListener(() => {
    console.log('LiteChat extension installed/updated');

    chrome.storage.sync.get([STORAGE_KEY_DARK_MODE, STORAGE_KEY_API_KEYS, STORAGE_KEY_MODEL_PARAMS], (result) => {
        if (result[STORAGE_KEY_DARK_MODE] === undefined) {
            chrome.storage.sync.set({ [STORAGE_KEY_DARK_MODE]: false });
        }

        if (!result[STORAGE_KEY_API_KEYS]) {
            chrome.storage.sync.set({ [STORAGE_KEY_API_KEYS]: { openai: '', claude: '', gemini: '' } });
        }

        if (!result[STORAGE_KEY_MODEL_PARAMS]) {
            chrome.storage.sync.set({ [STORAGE_KEY_MODEL_PARAMS]: DEFAULT_MODEL_PARAMETERS });
        } else {
            const mergedParams = {
                openai: { ...DEFAULT_MODEL_PARAMETERS.openai, ...(result[STORAGE_KEY_MODEL_PARAMS].openai || {}) },
                claude: { ...DEFAULT_MODEL_PARAMETERS.claude, ...(result[STORAGE_KEY_MODEL_PARAMS].claude || {}) },
                gemini: { ...DEFAULT_MODEL_PARAMETERS.gemini, ...(result[STORAGE_KEY_MODEL_PARAMS].gemini || {}) },
            };

            if (JSON.stringify(mergedParams) !== JSON.stringify(result[STORAGE_KEY_MODEL_PARAMS])) {
                chrome.storage.sync.set({ [STORAGE_KEY_MODEL_PARAMS]: mergedParams });
                console.log('Updated model parameters with defaults for missing keys.');
            }
        }
    });
});