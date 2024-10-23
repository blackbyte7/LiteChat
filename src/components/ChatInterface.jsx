import { useState, useRef, useContext, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { ChatContext } from '../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import { sendOpenAIMessage } from '../services/openai';
import { sendClaudeMessage } from '../services/claude';
import { sendGeminiMessage } from '../services/gemini';
import { estimateTokenCount } from '../utils/tokenCounter';

const ChatInterface = () => {
    const { colors } = useContext(ThemeContext);
    const { getActiveChat, addMessage, setLoading, loading } = useContext(ChatContext);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [tokenCount, setTokenCount] = useState(0);
    const imageInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const activeChat = getActiveChat();

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages]);

    useEffect(() => {
        setTokenCount(estimateTokenCount(input));
    }, [input]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!input.trim() && !selectedImage) return;

        const activeChat = getActiveChat();
        if (!activeChat) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        // Add image if selected
        if (selectedImage) {
            userMessage.image = selectedImage;
        }

        // Add message to chat
        addMessage(activeChat.id, userMessage);
        setInput('');
        setSelectedImage(null);
        setTokenCount(0);

        setLoading(true);

        try {
            // Get all messages for context
            const messages = [...activeChat.messages, userMessage];

            let response;

            // Call appropriate API based on provider
            switch (activeChat.provider) {
                case 'openai':
                    response = await sendOpenAIMessage(messages, activeChat.model);
                    break;
                case 'claude':
                    response = await sendClaudeMessage(messages, activeChat.model);
                    break;
                case 'gemini':
                    response = await sendGeminiMessage(messages, activeChat.model);
                    break;
                default:
                    throw new Error('Unknown provider');
            }

            // Add assistant response to chat
            addMessage(activeChat.id, response);
        } catch (error) {
            // Handle error
            addMessage(activeChat.id, {
                role: 'system',
                content: `Error: ${error.message}`,
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setSelectedImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    return (
        <div className="chat-interface"
             style={{
                 display: 'flex',
                 flexDirection: 'column',
                 height: '500px',
                 width: '100%',
                 backgroundColor: colors.background,
                 borderRadius: '8px',
                 overflow: 'hidden'
             }}
        >
            <div className="chat-header"
                 style={{
                     padding: '12px 16px',
                     backgroundColor: colors.primary,
                     color: '#fff',
                     fontWeight: 'bold'
                 }}
            >
                {activeChat?.title || 'New Chat'}
            </div>

            <div className="chat-messages"
                 style={{
                     flex: 1,
                     padding: '16px',
                     overflow: 'auto',
                     display: 'flex',
                     flexDirection: 'column'
                 }}
            >
                {activeChat?.messages.map((message, index) => (
                    <MessageBubble
                        key={index}
                        message={message}
                        chatId={activeChat.id}
                        index={index}
                    />
                ))}
                {loading && (
                    <div className="loading-indicator"
                         style={{
                             alignSelf: 'flex-start',
                             color: colors.text,
                             padding: '8px',
                             borderRadius: '8px',
                             backgroundColor: colors.messageBg,
                             marginBottom: '12px'
                         }}
                    >
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {selectedImage && (
                <div className="selected-image-container"
                     style={{
                         padding: '8px 16px',
                         borderTop: `1px solid ${colors.border}`,
                         position: 'relative'
                     }}
                >
                    <img
                        src={selectedImage}
                        alt="Selected"
                        style={{
                            maxHeight: '100px',
                            maxWidth: '100%',
                            borderRadius: '4px'
                        }}
                    />
                    <button
                        onClick={removeImage}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '18px',
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="chat-input-container"
                 style={{
                     padding: '12px 16px',
                     borderTop: `1px solid ${colors.border}`,
                     backgroundColor: colors.secondary
                 }}
            >
        <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={3}
            style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                resize: 'none',
                marginBottom: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text
            }}
        />

                <div className="input-actions"
                     style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center'
                     }}
                >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={() => imageInputRef.current.click()}
                            className="attach-button"
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: colors.primary,
                                cursor: 'pointer'
                            }}
                        >
                            Attach Image
                        </button>

                        <input
                            type="file"
                            ref={imageInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />

                        <span style={{ fontSize: '12px', color: colors.text }}>
              Tokens: {tokenCount}
            </span>
                    </div>

                    <button
                        onClick={handleSendMessage}
                        disabled={loading || (!input.trim() && !selectedImage)}
                        style={{
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            opacity: loading || (!input.trim() && !selectedImage) ? 0.7 : 1
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;