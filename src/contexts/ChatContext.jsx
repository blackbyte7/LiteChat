import { createContext, useState, useEffect, useCallback } from 'react';
import { saveChatHistory, loadChatHistory } from '../services/storage';
import { STORAGE_KEY_CHAT_HISTORY } from '../constants.js';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load history on initial mount
    useEffect(() => {
        const initializeChats = async () => {
            const history = await loadChatHistory();
            if (history.length > 0) {
                setChats(history);
                const firstChatId = history[0]?.id;
                if (firstChatId) {
                    setActiveChatId(firstChatId);
                } else {
                    console.warn("Loaded history was empty or malformed, creating initial chat.");
                    createNewChat();
                }
            } else {
                createNewChat();
            }
            setIsInitialized(true);
        };
        initializeChats();
    }, []);

    useEffect(() => {
        if (isInitialized && chats.length > 0) {
            saveChatHistory(chats);
        }
    }, [chats, isInitialized]);


    const createNewChat = useCallback((provider = 'openai', model) => {
        let defaultModelId;
        switch (provider) {
            case 'openai': defaultModelId = 'gpt-4o-mini-2024-07-18'; break;
            case 'claude': defaultModelId = 'claude-3-5-sonnet-20240620'; break;
            case 'gemini': defaultModelId = 'gemini-1.5-flash-latest'; break;
            default: defaultModelId = 'gpt-4o-mini-2024-07-18'; provider = 'openai'; // Fallback
        }

        const newChat = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            model: model || defaultModelId,
            provider: provider,
            createdAt: new Date().toISOString(),
        };

        setChats(prevChats => [newChat, ...prevChats]);
        setActiveChatId(newChat.id);
        return newChat;
    }, []);


    const deleteChat = useCallback((chatId) => {
        setChats(prevChats => {
            const updatedChats = prevChats.filter(chat => chat.id !== chatId);

            if (activeChatId === chatId) {
                const newActiveId = updatedChats.length > 0 ? updatedChats[0]?.id : null;
                setActiveChatId(newActiveId);
                if (newActiveId === null && updatedChats.length === 0) {
                    setTimeout(() => createNewChat(), 0);
                }
            }
            return updatedChats;
        });
    }, [activeChatId, createNewChat]);

    const addMessage = useCallback((chatId, message) => {
        setChats(prevChats => {
            let chatUpdated = false;
            const updatedChats = prevChats.map(chat => {
                if (chat.id === chatId) {
                    chatUpdated = true;

                    const newTitle = (chat.title === 'New Chat' && chat.messages.length === 0 && message.role === 'user' && message.content)
                        ? message.content.substring(0, 35) + (message.content.length > 35 ? '...' : '')
                        : chat.title;

                    return {
                        ...chat,
                        messages: [...chat.messages, message],
                        title: newTitle,
                        updatedAt: new Date().toISOString()
                    };
                }
                return chat;
            });
            return chatUpdated ? updatedChats : prevChats;
        });
    }, []);

    const updateStreamingMessage = useCallback((chatId, messageIndex, chunk, isFinal = false, finalData = {}) => {
        setChats(prevChats => {
            return prevChats.map(chat => {
                if (chat.id === chatId) {
                    const updatedMessages = [...chat.messages];
                    if (messageIndex >= 0 && messageIndex < updatedMessages.length) {
                        const currentMsg = updatedMessages[messageIndex];
                        updatedMessages[messageIndex] = {
                            ...currentMsg,
                            content: (currentMsg.content || '') + chunk,
                            ...(isFinal && {
                                streaming: false,
                                tokenUsage: finalData.tokenUsage || currentMsg.tokenUsage,
                                model: finalData.model || currentMsg.model,
                            }),
                            ...(chunk && !isFinal && { streaming: true })
                        };
                    } else {
                        console.error(`Invalid messageIndex ${messageIndex} for chat ${chatId}`);
                    }
                    return { ...chat, messages: updatedMessages, updatedAt: new Date().toISOString() };
                }
                return chat;
            });
        });
    }, []);


    const editMessage = useCallback((chatId, messageIndex, newContent) => {
        setChats(prevChats => {
            return prevChats.map(chat => {
                if (chat.id === chatId) {
                    const updatedMessages = [...chat.messages];
                    if (messageIndex >= 0 && messageIndex < updatedMessages.length && updatedMessages[messageIndex].role === 'user') {
                        updatedMessages[messageIndex] = {
                            ...updatedMessages[messageIndex],
                            content: newContent,
                            edited: true,
                            timestamp: new Date().toISOString()
                        };
                        return { ...chat, messages: updatedMessages, updatedAt: new Date().toISOString() };
                    } else {
                        console.warn(`Edit attempt failed: Invalid index (${messageIndex}) or not a user message.`);
                        return chat;
                    }
                }
                return chat;
            });
        });
    }, []);

    const getActiveChat = useCallback(() => {
        if (!Array.isArray(chats)) {
            console.error("Chat history is not an array:", chats);
            return null;
        }
        return chats.find(chat => chat.id === activeChatId);
    }, [chats, activeChatId]);

    return (
        <ChatContext.Provider
            value={{
                chats,
                activeChatId,
                setActiveChat: setActiveChatId,
                createNewChat,
                deleteChat,
                addMessage,
                updateStreamingMessage,
                editMessage,
                getActiveChat,
                loading,
                setLoading,
                isInitialized
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};