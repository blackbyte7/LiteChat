import { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { ChatContext } from '../contexts/ChatContext';
import CodeBlock from './CodeBlock';

const MessageBubble = ({ message, chatId, index }) => {
    const { colors } = useContext(ThemeContext);
    const { editMessage } = useContext(ChatContext);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);

    const isUser = message.role === 'user';

    // Process content to find code blocks
    const processContent = (content) => {
        if (!content) return [];

        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: content.substring(lastIndex, match.index)
                });
            }

            // Add code block
            parts.push({
                type: 'code',
                language: match[1] || '',
                content: match[2]
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < content.length) {
            parts.push({
                type: 'text',
                content: content.substring(lastIndex)
            });
        }

        return parts.length > 0 ? parts : [{ type: 'text', content }];
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        editMessage(chatId, index, editedContent);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedContent(message.content);
        setIsEditing(false);
    };

    const contentParts = processContent(message.content);

    const getProviderLabel = () => {
        switch (message.provider) {
            case 'openai':
                return 'OpenAI';
            case 'claude':
                return 'Claude';
            case 'gemini':
                return 'Gemini';
            default:
                return '';
        }
    };

    return (
        <div className={`message-bubble ${isUser ? 'user-message' : 'assistant-message'}`}
             style={{
                 backgroundColor: isUser ? colors.userMessageBg : colors.messageBg,
                 color: colors.text,
                 borderRadius: '8px',
                 padding: '12px 16px',
                 marginBottom: '12px',
                 maxWidth: '85%',
                 alignSelf: isUser ? 'flex-end' : 'flex-start',
                 position: 'relative'
             }}
        >
            {!isUser && message.model && (
                <div className="model-label"
                     style={{
                         fontSize: '11px',
                         color: '#888',
                         marginBottom: '6px'
                     }}
                >
                    {getProviderLabel()} - {message.model}
                </div>
            )}

            {isEditing ? (
                <div className="message-edit">
          <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              style={{
                  width: '100%',
                  minHeight: '100px',
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  padding: '8px',
                  marginBottom: '8px',
                  resize: 'vertical'
              }}
          />
                    <div className="edit-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleSave} className="save-button">Save</button>
                        <button onClick={handleCancel} className="cancel-button">Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="message-content">
                    {contentParts.map((part, i) => {
                        if (part.type === 'text') {
                            return (
                                <div key={i} style={{ whiteSpace: 'pre-wrap' }}>
                                    {part.content}
                                </div>
                            );
                        } else if (part.type === 'code') {
                            return <CodeBlock key={i} code={part.content} language={part.language} />;
                        }
                        return null;
                    })}

                    {message.image && (
                        <div className="message-image" style={{ marginTop: '8px' }}>
                            <img
                                src={message.image}
                                alt="Attached"
                                style={{ maxWidth: '100%', borderRadius: '4px' }}
                            />
                        </div>
                    )}

                    {message.edited && (
                        <div className="edited-label" style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                            (edited)
                        </div>
                    )}

                    {message.tokenUsage && (
                        <div className="token-usage" style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                            Tokens: {message.tokenUsage.total} ({message.tokenUsage.prompt} prompt, {message.tokenUsage.completion} completion)
                        </div>
                    )}
                </div>
            )}

            {!isEditing && (
                <div className="message-actions" style={{ position: 'absolute', top: '5px', right: '5px' }}>
                    <button
                        onClick={handleEdit}
                        className="edit-button"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#888',
                            padding: '3px',
                            fontSize: '12px',
                        }}
                    >
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
};

export default MessageBubble;