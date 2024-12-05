import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { loadModelParameters, saveModelParameters } from '../services/storage';
import { DEFAULT_MODEL_PARAMETERS } from '../constants';
import styles from './ModelParametersPanel.module.css';

const ModelParametersPanel = () => {
    const { colors } = useContext(ThemeContext);
    const [parameters, setParameters] = useState(DEFAULT_MODEL_PARAMETERS);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        loadModelParameters().then(params => {
            if (isMounted) {
                const mergedParams = {
                    openai: { ...DEFAULT_MODEL_PARAMETERS.openai, ...(params.openai || {}) },
                    claude: { ...DEFAULT_MODEL_PARAMETERS.claude, ...(params.claude || {}) },
                    gemini: { ...DEFAULT_MODEL_PARAMETERS.gemini, ...(params.gemini || {}) },
                };
                setParameters(mergedParams);
                setIsLoading(false);
            }
        }).catch(error => {
            console.error("Failed to load model parameters:", error);
            if (isMounted) {
                setStatus({ message: 'Error loading parameters.', type: 'error' });
                setIsLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, []);

    const handleSaveParameters = async () => {
        setStatus({ message: 'Saving...', type: '' });
        try {
            await saveModelParameters(parameters);
            setStatus({ message: 'Parameters saved successfully.', type: 'success' });
            setTimeout(() => setStatus({ message: '', type: '' }), 3000);
        } catch (error) {
            console.error("Failed to save model parameters:", error);
            setStatus({ message: `Error saving parameters: ${error.message}`, type: 'error' });
        }
    };

    // Helper to update nested state immutably
    const updateParameter = (provider, param, value) => {
        let processedValue = value;
        const paramType = typeof DEFAULT_MODEL_PARAMETERS[provider]?.[param];
        if (paramType === 'number') {
            processedValue = parseFloat(value);
            if (isNaN(processedValue)) processedValue = DEFAULT_MODEL_PARAMETERS[provider][param];
        } else if (paramType === 'string') {
            processedValue = String(value);
        }


        setParameters(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [param]: processedValue
            }
        }));
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading parameters...</div>;
    }


    return (
        <div className={styles.modelParametersPanel}>
            <h3 className={styles.sectionTitle}>Model Parameters</h3>
            <p className={styles.description}>
                Fine-tune the behavior of the language models. Changes apply to new messages.
            </p>


            {/* OpenAI Parameters */}
            <div className={styles.providerSection}>
                <h4 className={styles.providerTitle}>OpenAI (GPT Models)</h4>
                <div className={styles.parameterGrid}>
                    {/* Temperature */}
                    <div className={styles.parameterItem}>
                        <label htmlFor="openai-temperature">Temperature:</label>
                        <input
                            id="openai-temperature" type="number" min="0" max="2" step="0.1"
                            value={parameters.openai.temperature}
                            onChange={(e) => updateParameter('openai', 'temperature', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Controls randomness (0-2). Higher is more creative.</small>
                    </div>
                    <div className={styles.parameterItem}>
                        <label htmlFor="openai-max-tokens">Max Tokens:</label>
                        <input
                            id="openai-max-tokens" type="number" min="1" max="16384" step="1"
                            value={parameters.openai.max_tokens}
                            onChange={(e) => updateParameter('openai', 'max_tokens', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Max response length in tokens.</small>
                    </div>
                    <div className={styles.parameterItem}>
                        <label htmlFor="openai-top-p">Top P:</label>
                        <input
                            id="openai-top-p" type="number" min="0" max="1" step="0.05"
                            value={parameters.openai.top_p}
                            onChange={(e) => updateParameter('openai', 'top_p', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Nucleus sampling (0-1). Considers tokens comprising top P probability mass.</small>
                    </div>
                    <div className={styles.parameterItem}>
                        <label htmlFor="openai-frequency-penalty">Frequency Penalty:</label>
                        <input
                            id="openai-frequency-penalty" type="number" min="-2" max="2" step="0.1"
                            value={parameters.openai.frequency_penalty}
                            onChange={(e) => updateParameter('openai', 'frequency_penalty', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Penalizes repeating tokens (-2 to 2). Higher reduces repetition.</small>
                    </div>
                    <div className={styles.parameterItem}>
                        <label htmlFor="openai-presence-penalty">Presence Penalty:</label>
                        <input
                            id="openai-presence-penalty" type="number" min="-2" max="2" step="0.1"
                            value={parameters.openai.presence_penalty}
                            onChange={(e) => updateParameter('openai', 'presence_penalty', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Penalizes new tokens based on presence (-2 to 2). Higher encourages new topics.</small>
                    </div>
                </div>
            </div>

            <div className={styles.providerSection}>
                <h4 className={styles.providerTitle}>Anthropic (Claude Models)</h4>
                <div className={styles.parameterGrid}>
                    <div className={styles.parameterItem}>
                        <label htmlFor="claude-temperature">Temperature:</label>
                        <input
                            id="claude-temperature" type="number" min="0" max="1" step="0.1"
                            value={parameters.claude.temperature}
                            onChange={(e) => updateParameter('claude', 'temperature', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Controls randomness (0-1).</small>
                    </div>
                    <div className={styles.parameterItem}>
                        <label htmlFor="claude-max-tokens">Max Tokens:</label>
                        <input
                            id="claude-max-tokens" type="number" min="1" max="8192" step="1"
                            value={parameters.claude.max_tokens}
                            onChange={(e) => updateParameter('claude', 'max_tokens', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Max response length in tokens.</small>
                    </div>
                    <div className={styles.parameterItem}>
                        <label htmlFor="claude-top-p">Top P:</label>
                        <input
                            id="claude-top-p" type="number" min="0" max="1" step="0.05"
                            value={parameters.claude.top_p}
                            onChange={(e) => updateParameter('claude', 'top_p', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Nucleus sampling (0-1).</small>
                    </div>
                    <div className={styles.parameterItem}>
                        <label htmlFor="claude-top-k">Top K:</label>
                        <input
                            id="claude-top-k" type="number" min="1" max="500" step="1"
                            value={parameters.claude.top_k}
                            onChange={(e) => updateParameter('claude', 'top_k', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Limits sampling to top K likely tokens.</small>
                    </div>
                </div>
                <div className={`${styles.parameterItem} ${styles.fullWidth}`}>
                    <label htmlFor="claude-system-prompt">System Prompt:</label>
                    <textarea
                        id="claude-system-prompt"
                        value={parameters.claude.system_prompt}
                        onChange={(e) => updateParameter('claude', 'system_prompt', e.target.value)}
                        rows="4"
                        className={styles.paramTextarea}
                        placeholder="e.g., You are a helpful assistant specializing in..."
                    />
                    <small className={styles.paramDescription}>Custom instructions for Claude&#39;s behavior (prepended to conversation).</small>
                </div>
            </div>
            
            <div className={styles.providerSection}>
                <h4 className={styles.providerTitle}>Google (Gemini Models)</h4>
                <div className={styles.parameterGrid}>
                    <div className={styles.parameterItem}>
                        <label htmlFor="gemini-temperature">Temperature:</label>
                        <input
                            id="gemini-temperature" type="number" min="0" max="1" step="0.1"
                            value={parameters.gemini.temperature}
                            onChange={(e) => updateParameter('gemini', 'temperature', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Controls randomness (0-1).</small>
                    </div>
                    <div className={styles.parameterItem}>
                        <label htmlFor="gemini-max-output-tokens">Max Output Tokens:</label>
                        <input
                            id="gemini-max-output-tokens" type="number" min="1" max="8192" step="1"
                            value={parameters.gemini.max_output_tokens}
                            onChange={(e) => updateParameter('gemini', 'max_output_tokens', e.target.value)}
                            className={styles.paramInput}
                        />
                        <small className={styles.paramDescription}>Max response length in tokens.</small>
                    </div>
                </div>
                <div className={`${styles.parameterItem} ${styles.fullWidth}`}>
                    <label htmlFor="gemini-system-prompt">System Instruction:</label>
                    <textarea
                        id="gemini-system-prompt"
                        value={parameters.gemini.system_prompt || ''}
                        onChange={(e) => updateParameter('gemini', 'system_prompt', e.target.value)} 
                        rows="4"
                        className={styles.paramTextarea}
                        placeholder="Optional system instructions for Gemini..."
                    />
                    <small className={styles.paramDescription}>System instructions for Gemini (handled differently than Claude&#39;s system prompt).</small>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    onClick={handleSaveParameters}
                    className={styles.saveButton}
                    disabled={status.message === 'Saving...'}
                >
                    {status.message === 'Saving...' ? 'Saving...' : 'Save Parameters'}
                </button>

                {status.message && status.message !== 'Saving...' && (
                    <div className={`${styles.statusMessage} ${styles[status.type]}`}>
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelParametersPanel;