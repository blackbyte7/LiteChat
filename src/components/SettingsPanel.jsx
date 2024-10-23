import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { loadApiKeys, saveApiKeys } from '../services/storage';

const SettingsPanel = () => {
    const { colors, toggleTheme, darkMode } = useContext(ThemeContext);
    const [apiKeys, setApiKeys] = useState({
        openai: '',
        claude: '',
        gemini: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        loadApiKeys().then(keys => {
            setApiKeys({
                openai: keys.openai || '',
                claude: keys.claude || '',
                gemini: keys.gemini || ''
            });
        });
    }, []);

    const handleSaveKeys = async () => {
        try {
            await saveApiKeys(apiKeys);
            setStatus('API keys saved successfully');
            setIsEditing(false);
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            setStatus(`Error saving API keys: ${error.message}`);
        }
    };

    const maskApiKey = (key) => {
        if (!key) return '';
        if (key.length <= 8) return '*'.repeat(key.length);
        return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
    };

    return (
        <div className="settings-panel"
             style={{
                 padding: '20px',
                 backgroundColor: colors.background,
                 color: colors.text,
                 borderRadius: '8px',
                 maxWidth: '500px',
                 margin: '0 auto'
             }}
        >
            <h2 style={{ marginTop: 0 }}>Settings</h2>

            <div className="theme-toggle"
                 style={{
                     marginBottom: '20px'
                 }}
            >
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <span style={{ marginRight: '10px' }}>Theme:</span>
                    <div
                        style={{
                            width: '50px',
                            height: '24px',
                            backgroundColor: darkMode ? colors.secondary : colors.border,
                            borderRadius: '12px',
                            position: 'relative',
                            transition: 'background-color 0.3s'
                        }}
                        onClick={toggleTheme}
                    >
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: darkMode ? colors.primary : '#ffffff',
                                position: 'absolute',
                                top: '2px',
                                left: darkMode ? '28px' : '2px',
                                transition: 'left 0.3s'
                            }}
                        />
                    </div>
                    <span style={{ marginLeft: '10px' }}>{darkMode ? 'Dark' : 'Light'}</span>
                </label>
            </div>

            <div className="api-keys"
                 style={{
                     marginBottom: '20px'
                 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0 }}>API Keys</h3>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        style={{
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer'
                        }}
                    >
                        {isEditing ? 'Cancel' : 'Edit Keys'}
                    </button>
                </div>

                {isEditing ? (
                    <div className="api-keys-form">
                        <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '6px' }}>OpenAI API Key:</label>
                            <input
                                type="password"
                                value={apiKeys.openai}
                                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: `1px solid ${colors.border}`,
                                    backgroundColor: colors.inputBg,
                                    color: colors.text
                                }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '6px' }}>Claude API Key:</label>
                            <input
                                type="password"
                                value={apiKeys.claude}
                                onChange={(e) => setApiKeys({ ...apiKeys, claude: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: `1px solid ${colors.border}`,
                                    backgroundColor: colors.inputBg,
                                    color: colors.text
                                }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '6px' }}>Gemini API Key:</label>
                            <input
                                type="password"
                                value={apiKeys.gemini}
                                onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: `1px solid ${colors.border}`,
                                    backgroundColor: colors.inputBg,
                                    color: colors.text
                                }}
                            />
                        </div>

                        <button
                            onClick={handleSaveKeys}
                            style={{
                                backgroundColor: colors.primary,
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                marginTop: '10px'
                            }}
                        >
                            Save Keys
                        </button>
                    </div>
                ) : (
                    <div className="api-keys-display">
                        <div style={{ marginBottom: '8px' }}>
                            <strong>OpenAI:</strong> {apiKeys.openai ? maskApiKey(apiKeys.openai) : 'Not set'}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Claude:</strong> {apiKeys.claude ? maskApiKey(apiKeys.claude) : 'Not set'}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Gemini:</strong> {apiKeys.gemini ? maskApiKey(apiKeys.gemini) : 'Not set'}
                        </div>
                    </div>
                )}

                {status && (
                    <div className="status-message"
                         style={{
                             marginTop: '10px',
                             padding: '8px',
                             borderRadius: '4px',
                             backgroundColor: status.includes('Error') ? '#ffdddd' : '#ddffdd',
                             color: status.includes('Error') ? '#ff0000' : '#00aa00'
                         }}
                    >
                        {status}
                    </div>
                )}
            </div>

            <div className="about-section">
                <h3>About</h3>
                <p>
                    Universal LLM Chat is a lightweight Chrome extension that allows you to interact with
                    multiple language models including OpenAI's GPT, Anthropic's Claude, and Google's Gemini.
                </p>
                <p>
                    Simply add your API keys in the settings and start chatting with your preferred models.
                </p>
            </div>
        </div>
    );
};

export default SettingsPanel;