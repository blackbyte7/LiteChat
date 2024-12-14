import { useContext, useState, useRef, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { ChatContext } from '../contexts/ChatContext';
import { openaiModels, claudeModels, geminiModels } from '../constants';
import styles from './ChatControls.module.css';

const ChatControls = () => {
    const { colors } = useContext(ThemeContext);
    const { chats, activeChatId, setActiveChat, createNewChat, deleteChat } = useContext(ChatContext);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const handleNewChat = (provider, model) => {
        createNewChat(provider, model);
        setShowMenu(false);
    };

    const handleDeleteChat = (e, chatId) => {
        e.stopPropagation();

        if (window.confirm(`Are you sure you want to delete this chat?`)) {
            deleteChat(chatId);
        }
    };

    // Close menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getModelDisplayName = (provider, modelId) => {
        const models = provider === 'openai' ? openaiModels : provider === 'claude' ? claudeModels : geminiModels;
        const model = models.find(m => m.id === modelId);
        return model ? model.name : modelId;
    };

    return (
        <div className={styles.chatControls}>
            <div className={styles.newChatContainer}>
                <button
                    ref={buttonRef}
                    onClick={() => setShowMenu(!showMenu)}
                    className={styles.newChatButton}
                    aria-haspopup="true"
                    aria-expanded={showMenu}
                >
                    New Chat
                </button>

                {showMenu && (
                    <div ref={menuRef} className={styles.modelMenu} role="menu">
                        <div className={styles.providerSection}>
                            <strong className={styles.providerTitle}>OpenAI</strong>
                            {openaiModels.map(model => (
                                <div
                                    key={model.id}
                                    role="menuitem"
                                    onClick={() => handleNewChat('openai', model.id)}
                                    className={styles.modelOption}
                                >
                                    {model.name}
                                </div>
                            ))}
                        </div>

                        <div className={styles.providerSection}>
                            <strong className={styles.providerTitle}>Claude</strong>
                            {claudeModels.map(model => (
                                <div
                                    key={model.id}
                                    role="menuitem"
                                    onClick={() => handleNewChat('claude', model.id)}
                                    className={styles.modelOption}
                                >
                                    {model.name}
                                </div>
                            ))}
                        </div>

                        <div className={styles.providerSection}>
                            <strong className={styles.providerTitle}>Gemini</strong>
                            {geminiModels.map(model => (
                                <div
                                    key={model.id}
                                    role="menuitem"
                                    onClick={() => handleNewChat('gemini', model.id)}
                                    className={styles.modelOption}
                                >
                                    {model.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.chatList}>
                {chats.map(chat => (
                    <div
                        key={chat.id}
                        onClick={() => setActiveChat(chat.id)}
                        className={`${styles.chatItem} ${chat.id === activeChatId ? styles.active : ''}`}
                        role="button"
                        tabIndex="0"
                        aria-current={chat.id === activeChatId ? "page" : undefined}
                    >
                        <div className={styles.chatInfo}>
                            <div className={styles.chatTitle}>{chat.title}</div>
                            <div className={styles.chatModel}>
                                {getModelDisplayName(chat.provider, chat.model)}
                            </div>
                        </div>
                        <button
                            onClick={(e) => handleDeleteChat(e, chat.id)}
                            className={styles.deleteButton}
                            aria-label={`Delete chat: ${chat.title}`}
                        >
                            ×
                        </button>
                    </div>
                ))}
                {chats.length === 0 && (
                    <div className={styles.noChatsMessage}>No chats yet. Start a new one!</div>
                )}
            </div>
        </div>
    );
};

export default ChatControls;