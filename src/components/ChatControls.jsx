import { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { ChatContext } from '../contexts/ChatContext';
import { openaiModels } from '../services/openai';
import { claudeModels } from '../services/claude';
import { geminiModels } from '../services/gemini';

const ChatControls = () => {
    const { colors } = useContext(ThemeContext);
    const { chats, activeChat, setActiveChat, createNewChat, deleteChat } = useContext(ChatContext);
    const [showMenu, setShowMenu] = useState(false);

    const handleNewChat = (provider, model) => {
        createNewChat(provider, model);
        setShowMenu(false);
    };

    const handleDeleteChat = (e, chatId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this chat?')) {
            deleteChat(chatId);
        }
    };

    return (
        <div className="chat-controls"
             style={{
                 padding: '16px',
                 backgroundColor: colors.secondary,
                 borderRight: `1px solid ${colors.border}`,
                 width: '220px',
                 display: 'flex',
                 flexDirection: 'column'
             }}
        >
            <div className="new-chat-container" style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    style={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px',
                        width: '100%',
                        marginBottom: '16px',
                        cursor: 'pointer'
                    }}
                >
                    New Chat
                </button>

                {showMenu && (
                    <div className="model-menu"
                         style={{
                             position: 'absolute',
                             backgroundColor: colors.background,
                             border: `1px solid ${colors.border}`,
                             borderRadius: '8px',
                             boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                             zIndex: 10,
                             width: '200px'
                         }}
                    >
                        <div style={{ padding: '8px', borderBottom: `1px solid ${colors.border}` }}>
                            <strong>OpenAI</strong>
                            {openaiModels.map(model => (
                                <div
                                    key={model.id}
                                    onClick={() => handleNewChat('openai', model.id)}
                                    style={{
                                        padding: '6px',
                                        cursor: 'pointer',
                                        borderRadius: '4px'
                                    }}
                                    className="model-option"
                                >
                                    {model.name}
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '8px', borderBottom: `1px solid ${colors.border}` }}>
                            <strong>Claude</strong>
                            {claudeModels.map(model => (
                                <div
                                    key={model.id}
                                    onClick={() => handleNewChat('claude', model.id)}
                                    style={{
                                        padding: '6px',
                                        cursor: 'pointer',
                                        borderRadius: '4px'
                                    }}
                                    className="model-option"
                                >
                                    {model.name}
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '8px' }}>
                            <strong>Gemini</strong>
                            {geminiModels.map(model => (
                                <div
                                    key={model.id}
                                    onClick={() => handleNewChat('gemini', model.id)}
                                    style={{
                                        padding: '6px',
                                        cursor: 'pointer',
                                        borderRadius: '4px'
                                    }}
                                    className="model-option"
                                >
                                    {model.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="chat-list"
                 style={{
                     flex: 1,
                     overflowY: 'auto'
                 }}
            >
                {chats.map(chat => (
                    <div
                        key={chat.id}
                        onClick={() => setActiveChat(chat.id)}
                        className={`chat-item ${chat.id === activeChat ? 'active' : ''}`}
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            marginBottom: '6px',
                            cursor: 'pointer',
                            backgroundColor: chat.id === activeChat ? colors.primary + '22' : 'transparent',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div className="chat-title"
                             style={{
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 whiteSpace: 'nowrap',
                                 fontSize: '14px',
                                 color: colors.text
                             }}
                        >
                            {chat.title}
                        </div>
                        <button
                            onClick={(e) => handleDeleteChat(e, chat.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: colors.text,
                                opacity: 0.6,
                                fontSize: '12px',
                                padding: '4px'
                            }}
                            className="delete-button"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatControls;