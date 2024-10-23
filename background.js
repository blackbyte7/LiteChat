/* global chrome */

chrome.runtime.onInstalled.addListener(() => {
    console.log('Universal LLM Chat extension installed');

    // Initialize default settings if needed
    chrome.storage.sync.get(['darkMode', 'apiKeys'], (result) => {
        if (result.darkMode === undefined) {
            chrome.storage.sync.set({ darkMode: false });
        }

        if (!result.apiKeys) {
            chrome.storage.sync.set({ apiKeys: { openai: '', claude: '', gemini: '' } });
        }
    });
});