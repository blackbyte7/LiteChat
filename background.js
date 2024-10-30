/* global chrome */

chrome.runtime.onInstalled.addListener(() => {
    console.log('Universal LLM Chat extension installed');

    // Initialize default settings if needed
    chrome.storage.sync.get(['darkMode', 'apiKeys', 'modelParameters'], (result) => {
        if (result.darkMode === undefined) {
            chrome.storage.sync.set({ darkMode: false });
        }

        if (!result.apiKeys) {
            chrome.storage.sync.set({ apiKeys: { openai: '', claude: '', gemini: '' } });
        }

        if (!result.modelParameters) {
            chrome.storage.sync.set({
                modelParameters: {
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
                }
            });
        }
    });
});