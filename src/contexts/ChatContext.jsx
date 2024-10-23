import { createContext, useState, useEffect } from 'react';
import { saveChatHistory, loadChatHistory } from '../services/storage';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadChatHistory().then((history) => {
            if (history.length > 0) {
                setChats(history);
                setActiveChat(history[0].id);
            } else {
                const initialChat = {
                    id: Date.now().toString(),
                    title: 'New Chat',
                    messages: [],
                    model: 'gpt-3.5-turbo',
                    provider: 'openai'
                };
                setChats([initialChat]);
                setActiveChat(initialChat.id);
                saveChatHistory([initialChat]);
            }
        });
    }, []);

    const createNewChat = (provider = 'openai', model = 'gpt-3.5-turbo') => {
        const newChat = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            model,
            provider
        };

        const updatedChats = [newChat, ...chats];
        setChats(updatedChats);
        setActiveChat(newChat.id);
        saveChatHistory(updatedChats);
        return newChat;
    };

    const deleteChat = (chatId) => {
        const updatedChats = chats.filter(chat => chat.id !== chatId);
        setChats(updatedChats);

        if (activeChat === chatId) {
            setActiveChat(updatedChats.length > 0 ? updatedChats[0].id : null);
        }

        saveChatHistory(updatedChats);
    };

    const addMessage = (chatId, message) => {
        const updatedChats = chats.map(chat => {
            if (chat.id === chatId) {
                return {
                    ...chat,
                    messages: [...chat.messages, message],
                    title: chat.messages.length === 0 && message.role === 'user'
                        ? message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '')
                        : chat.title
                };
            }
            return chat;
        });

        setChats(updatedChats);
        saveChatHistory(updatedChats);
    };

    const editMessage = (chatId, messageIndex, newContent) => {
        const updatedChats = chats.map(chat => {
            if (chat.id === chatId) {
                const updatedMessages = [...chat.messages];
                updatedMessages[messageIndex] = {
                    ...updatedMessages[messageIndex],
                    content: newContent,
                    edited: true
                };
                return { ...chat, messages: updatedMessages };
            }
            return chat;
        });

        setChats(updatedChats);
        saveChatHistory(updatedChats);
    };

    const getActiveChat = () => {
        return chats.find(chat => chat.id === activeChat);
    };

    return (
        <ChatContext.Provider
            value={{
                chats,
                activeChat,
                setActiveChat,
                createNewChat,
                deleteChat,
                addMessage,
                editMessage,
                getActiveChat,
                loading,
                setLoading
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};