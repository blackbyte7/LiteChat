import { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { ChatContext } from '../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import { sendOpenAIMessageStream } from '../services/openai';
import { sendClaudeMessageStream } from '../services/claude';
import { sendGeminiMessageStream } from '../services/gemini';
import { estimateTokenCount } from '../utils/TokenCounter';
import styles from './ChatInterface.module.css';

const ChatInterface = () => {
    const { colors } = useContext(ThemeContext);
    const {
        getActiveChat,
        addMessage,
        updateStreamingMessage,
        setLoading,
        loading,
        //activeChatId
    } = useContext(ChatContext);

    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageName, setSelectedImageName] = useState('');
    const [tokenCount, setTokenCount] = useState(0);
    const [error, setError] = useState(null);

    const imageInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const activeChat = getActiveChat();

    // Auto-scroll effect
    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages?.length, activeChat?.messages[activeChat.messages.length -1]?.content]);


    // Token counting effect
    useEffect(() => {
        let isMounted = true;
        async function updateCount() {
            const count = await estimateTokenCount(input);
            if (isMounted) {
                setTokenCount(count);
            }
        }
        updateCount();
        return () => { isMounted = false; };
    }, [input]);

    // Adjust textarea height dynamically
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
        }
    }, [input]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = useCallback(async () => {
        if (loading || (!input.trim() && !selectedImage)) return;
        if (!activeChat) {
            setError("No active chat selected.");
            return;
        }

        setError(null);
        setLoading(true);

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString(),
            image: selectedImage
        };
        addMessage(activeChat.id, userMessage);

        const assistantMessagePlaceholder = {
            role: 'assistant',
            content: '',
            provider: activeChat.provider,
            model: activeChat.model,
            timestamp: new Date().toISOString(),
            streaming: true,
        };
        addMessage(activeChat.id, assistantMessagePlaceholder);
        const assistantMessageIndex = activeChat.messages.length + 1;

        setInput('');
        setSelectedImage(null);
        setSelectedImageName('');
        setTokenCount(0);
        if (imageInputRef.current) imageInputRef.current.value = '';

        // Streaming Logic
        const messagesForApi = [...activeChat.messages, userMessage];

        const handleChunk = (chunk) => {
            updateStreamingMessage(activeChat.id, assistantMessageIndex, chunk);
        };

        const handleComplete = (finalData) => {
            updateStreamingMessage(activeChat.id, assistantMessageIndex, '', true, finalData);
            setLoading(false);
        };

        const handleError = (err) => {
            console.error("API Error:", err);
            const errorMessage = `Error: ${err.message || 'Failed to get response.'}`;
            updateStreamingMessage(
                activeChat.id,
                assistantMessageIndex,
                errorMessage,
                true,
                { error: true }
            );
            setError(errorMessage);
            setLoading(false);
        };

        try {
            switch (activeChat.provider) {
                case 'openai':
                    await sendOpenAIMessageStream(messagesForApi, activeChat.model, handleChunk, handleComplete, handleError);
                    break;
                case 'claude':
                    await sendClaudeMessageStream(messagesForApi, activeChat.model, handleChunk, handleComplete, handleError);
                    break;
                case 'gemini':
                    await sendGeminiMessageStream(messagesForApi, activeChat.model, handleChunk, handleComplete, handleError);
                    break;
                default:
                    handleError(new Error(`Unknown provider: ${activeChat.provider}`));
            }
        } catch (error) {
            handleError(error);
        }

    }, [activeChat, input, selectedImage, loading, setLoading, addMessage, updateStreamingMessage, setError]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (JPEG, PNG, GIF, WEBP).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should not exceed 5MB.');
            return;
        }


        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedImage(event.target.result);
            setSelectedImageName(file.name);
        };
        reader.onerror = (error) => {
            console.error("FileReader error:", error);
            alert("Failed to read the image file.");
            setSelectedImage(null);
            setSelectedImageName('');
            if (imageInputRef.current) imageInputRef.current.value = '';
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
        setSelectedImageName('');
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    return (
        <div className={styles.chatInterface}>
            <div className={styles.chatHeader}>
                {activeChat?.title || 'Select a Chat'}
                {activeChat && <span className={styles.headerModelInfo}>({activeChat.provider} / {activeChat.model})</span>}
            </div>

            <div className={styles.chatMessages}>
                {!activeChat && (
                    <div className={styles.noChatSelected}>
                        Select a chat or start a new one to begin.
                    </div>
                )}
                {activeChat?.messages.map((message, index) => (
                    <MessageBubble
                        key={`${activeChat.id}-${index}`}
                        message={message}
                        chatId={activeChat.id}
                        index={index}
                    />
                ))}
                {loading && activeChat?.messages[activeChat.messages.length-1]?.streaming && (
                    <div className={styles.streamingIndicator}>
                        <div className={styles.dotFlashing}></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                    <button onClick={() => setError(null)} className={styles.dismissErrorButton}>×</button>
                </div>
            )}

            {selectedImage && (
                <div className={styles.imagePreviewContainer}>
                    <img
                        src={selectedImage}
                        alt={selectedImageName || 'Selected image'}
                        className={styles.previewImage}
                    />
                    <span className={styles.imageName}>{selectedImageName}</span>
                    <button
                        onClick={removeImage}
                        className={styles.removeImageButton}
                        aria-label="Remove selected image"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className={styles.chatInputContainer}>
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message (Shift+Enter for new line)..."
                    className={styles.inputTextArea}
                    rows={1}
                    disabled={loading}
                    aria-label="Chat message input"
                />
                <div className={styles.inputActions}>
                    <div className={styles.actionButtonsLeft}>
                        <button
                            onClick={() => imageInputRef.current?.click()}
                            className={styles.attachButton}
                            disabled={loading}
                            aria-label="Attach image"
                        >
                        </button>
                        <input
                            type="file"
                            ref={imageInputRef}
                            onChange={handleFileSelect}
                            accept="image/jpeg, image/png, image/gif, image/webp"
                            style={{ display: 'none' }}
                        />
                        <span className={styles.tokenCounter} aria-live="polite">
                            Tokens: {tokenCount}
                        </span>
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={loading || (!input.trim() && !selectedImage)}
                        className={styles.sendButton}
                        aria-label="Send message"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;