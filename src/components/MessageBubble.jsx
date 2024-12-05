import { useState, useContext, useRef, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { ChatContext } from '../contexts/ChatContext';
import CodeBlock from './CodeBlock';
import { formatTimestamp } from '../utils/TokenCounter';
import styles from './MessageBubble.module.css';

const MessageBubble = ({ message, chatId, index }) => {
    const { colors } = useContext(ThemeContext);
    const { editMessage } = useContext(ChatContext);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);
    const editInputRef = useRef(null);
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const isAssistant = message.role === 'assistant';

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.selectionStart = editInputRef.current.value.length;
            editInputRef.current.selectionEnd = editInputRef.current.value.length;

            adjustTextareaHeight(editInputRef.current);
        }
    }, [isEditing]);

    const adjustTextareaHeight = (textarea) => {
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const processContent = (content) => {
        if (typeof content !== 'string' || !content) return [];

        const codeBlockRegex = /```(\w+)?\r?\n([\s\S]*?)\r?\n?```/g;
        let parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: content.substring(lastIndex, match.index)
                });
            }
            parts.push({
                type: 'code',
                language: match[1] || 'plaintext',
                content: match[2]
            });
            lastIndex = codeBlockRegex.lastIndex;
        }

        if (lastIndex < content.length) {
            parts.push({
                type: 'text',
                content: content.substring(lastIndex)
            });
        }

        return parts.length > 0 ? parts : [{ type: 'text', content }];
    };

    const handleEdit = () => {
        if (!isUser) return;
        setEditedContent(message.content);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!editedContent.trim()) return;
        editMessage(chatId, index, editedContent.trim());
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleTextareaKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const contentParts = processContent(message.content);

    const bubbleClasses = [
        styles.messageBubble,
        isUser ? styles.userMessage : styles.assistantMessage,
        isSystem ? styles.systemMessage : '',
        message.streaming ? styles.streaming : '',
        message.error ? styles.errorMessageType : ''
    ].join(' ');


    return (
        <div className={bubbleClasses}>
            <div className={styles.messageHeader}>
                <span className={styles.senderLabel}>
                    {isAssistant && message.model ? `Assistant (${message.model})` : isUser ? 'You' : isSystem ? 'System' : ''}
                 </span>
                <span className={styles.timestamp} title={new Date(message.timestamp).toLocaleString()}>
                    {formatTimestamp(message.timestamp)}
                 </span>
            </div>

            {isEditing ? (
                <div className={styles.messageEdit}>
                    <textarea
                        ref={editInputRef}
                        value={editedContent}
                        onChange={(e) => {
                            setEditedContent(e.target.value);
                            adjustTextareaHeight(e.target);
                        }}
                        onKeyDown={handleTextareaKeyDown}
                        className={styles.editTextArea}
                        rows={1}
                        aria-label="Edit message content"
                    />
                    <div className={styles.editActions}>
                        <button onClick={handleSave} className={`${styles.editButton} ${styles.saveButton}`}>Save</button>
                        <button onClick={handleCancel} className={`${styles.editButton} ${styles.cancelButton}`}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className={styles.messageContent}>
                    {contentParts.map((part, i) => {
                        if (part.type === 'text') {
                            return <div key={i} style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{part.content}</div>;
                        } else if (part.type === 'code') {
                            return <CodeBlock key={i} code={part.content} language={part.language} />;
                        }
                        return null;
                    })}

                    {message.image && (
                        <div className={styles.messageImageContainer}>
                            <img
                                src={message.image}
                                alt="Attached"
                                className={styles.messageImage}
                            />
                        </div>
                    )}

                    <div className={styles.messageFooter}>
                        {message.edited && <span className={styles.editedLabel}>(edited)</span>}
                        {isAssistant && message.tokenUsage && (message.tokenUsage.total > 0) && (
                            <span className={styles.tokenUsage}>
                                Tokens: {message.tokenUsage.total} (P:{message.tokenUsage.prompt}, C:{message.tokenUsage.completion})
                            </span>
                        )}
                    </div>


                </div>
            )}

            {!isEditing && isUser && (
                <div className={styles.messageActions}>
                    <button
                        onClick={handleEdit}
                        className={styles.actionButton}
                        aria-label="Edit message"
                    >
                        ✏️
                    </button>
                </div>
            )}
        </div>
    );
};

export default MessageBubble;