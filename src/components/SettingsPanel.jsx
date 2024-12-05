import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { loadApiKeys, saveApiKeys } from '../services/storage';
import ModelParametersPanel from './ModelParametersPanel';
import styles from './SettingsPanel.module.css';

const SettingsPanel = () => {
    const { toggleTheme, darkMode } = useContext(ThemeContext);
    const [apiKeys, setApiKeys] = useState({ openai: '', claude: '', gemini: '' });
    const [tempKeys, setTempKeys] = useState({ openai: '', claude: '', gemini: '' });
    const [isEditingKeys, setIsEditingKeys] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        loadApiKeys().then(keys => {
            if (isMounted) {
                setApiKeys(keys);
                setTempKeys(keys);
                setIsLoading(false);
            }
        }).catch(error => {
            console.error("Failed to load API keys:", error);
            if (isMounted) {
                setStatus({ message: 'Error loading API keys.', type: 'error' });
                setIsLoading(false);
            }
        });
        return () => { isMounted = false };
    }, []);

    const handleEditKeys = () => {
        setTempKeys(apiKeys);
        setIsEditingKeys(true);
        setStatus({ message: '', type: '' });
    };

    const handleCancelEdit = () => {
        setIsEditingKeys(false);
    };

    const handleSaveKeys = async () => {
        setStatus({ message: 'Saving...', type: '' });
        try {
            await saveApiKeys(tempKeys);
            setApiKeys(tempKeys);
            setStatus({ message: 'API keys saved successfully.', type: 'success' });
            setIsEditingKeys(false);
            setTimeout(() => setStatus({ message: '', type: '' }), 3000);
        } catch (error) {
            console.error("Failed to save API keys:", error);
            setStatus({ message: `Error saving API keys: ${error.message}`, type: 'error' });
        }
    };

    const maskApiKey = (key) => {
        if (!key || typeof key !== 'string') return '';
        if (key.length <= 8) return '********';
        return `${key.substring(0, 4)}****${key.substring(key.length - 4)}`;
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading settings...</div>;
    }


    return (
        <div className={styles.settingsPanel}>
            <h2 className={styles.settingsTitle}>Settings</h2>

            <div className={styles.tabs}>
                <button
                    onClick={() => setActiveTab('general')}
                    className={`${styles.tabButton} ${activeTab === 'general' ? styles.activeTab : ''}`}
                    aria-selected={activeTab === 'general'}
                    role="tab"
                >
                    General
                </button>
                <button
                    onClick={() => setActiveTab('parameters')}
                    className={`${styles.tabButton} ${activeTab === 'parameters' ? styles.activeTab : ''}`}
                    aria-selected={activeTab === 'parameters'}
                    role="tab"
                >
                    Model Parameters
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'general' ? (
                    <div role="tabpanel" aria-labelledby="tab-general">
                        <div className={styles.settingSection}>
                            <h3 className={styles.settingTitle}>Appearance</h3>
                            <label className={styles.themeToggleLabel}>
                                <span className={styles.labelText}>Theme:</span>
                                <div
                                    className={`${styles.themeSwitch} ${darkMode ? styles.switchDark : ''}`}
                                    onClick={toggleTheme}
                                    role="switch"
                                    aria-checked={darkMode}
                                    title={`Switch to ${darkMode ? 'Light' : 'Dark'} Mode`}
                                >
                                    <div className={styles.switchKnob} />
                                </div>
                                <span className={styles.themeName}>{darkMode ? 'Dark' : 'Light'}</span>
                            </label>
                        </div>
                        <div className={styles.settingSection}>
                            <div className={styles.sectionHeader}>
                                <h3 className={styles.settingTitle}>API Keys</h3>
                                {!isEditingKeys && (
                                    <button onClick={handleEditKeys} className={styles.editButton}>Edit Keys</button>
                                )}
                            </div>

                            {isEditingKeys ? (
                                <div className={styles.apiKeysForm}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="openai-key" className={styles.keyLabel}>OpenAI API Key:</label>
                                        <input
                                            id="openai-key" type="password" autoComplete="off"
                                            value={tempKeys.openai}
                                            onChange={(e) => setTempKeys({ ...tempKeys, openai: e.target.value })}
                                            className={styles.keyInput}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="claude-key" className={styles.keyLabel}>Claude API Key:</label>
                                        <input
                                            id="claude-key" type="password" autoComplete="off"
                                            value={tempKeys.claude}
                                            onChange={(e) => setTempKeys({ ...tempKeys, claude: e.target.value })}
                                            className={styles.keyInput}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="gemini-key" className={styles.keyLabel}>Gemini API Key:</label>
                                        <input
                                            id="gemini-key" type="password" autoComplete="off"
                                            value={tempKeys.gemini}
                                            onChange={(e) => setTempKeys({ ...tempKeys, gemini: e.target.value })}
                                            className={styles.keyInput}
                                        />
                                    </div>
                                    <div className={styles.editActions}>
                                        <button onClick={handleSaveKeys} className={styles.saveButton} disabled={status.message === 'Saving...'}>
                                            {status.message === 'Saving...' ? 'Saving...' : 'Save Keys'}
                                        </button>
                                        <button onClick={handleCancelEdit} className={styles.cancelButton}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.apiKeysDisplay}>
                                    <p><strong>OpenAI:</strong> {apiKeys.openai ? maskApiKey(apiKeys.openai) : <span className={styles.notSet}>Not set</span>}</p>
                                    <p><strong>Claude:</strong> {apiKeys.claude ? maskApiKey(apiKeys.claude) : <span className={styles.notSet}>Not set</span>}</p>
                                    <p><strong>Gemini:</strong> {apiKeys.gemini ? maskApiKey(apiKeys.gemini) : <span className={styles.notSet}>Not set</span>}</p>
                                    <p className={styles.storageNote}>
                                        API keys are stored securely using chrome.storage.sync and sync across your devices.
                                    </p>
                                </div>
                            )}

                            {status.message && status.message !== 'Saving...' && (
                                <div className={`${styles.statusMessage} ${styles[status.type]}`}>
                                    {status.message}
                                </div>
                            )}
                        </div>

                        <div className={styles.settingSection}>
                            <h3 className={styles.settingTitle}>About LiteChat</h3>
                            <p className={styles.aboutText}>
                                A lightweight Chrome extension for interacting with multiple AI models (OpenAI, Claude, Gemini).
                                Manage API keys and tune model parameters for a customized chat experience.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div role="tabpanel" aria-labelledby="tab-parameters">
                        <ModelParametersPanel />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPanel;