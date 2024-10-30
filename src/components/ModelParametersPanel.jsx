// src/components/ModelParametersPanel.jsx
import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { loadModelParameters, saveModelParameters } from '../services/storage';

const ModelParametersPanel = () => {
    const { colors } = useContext(ThemeContext);
    const [parameters, setParameters] = useState({
        openai: {
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        },
        claude: {
            temperature: 0.7,
            max_tokens: 4000,
            top_p: 1,
            top_k: 50,
            system_prompt: ''
        },
        gemini: {
            temperature: 0.7,
            max_output_tokens: 2048
        }
    });
    const [status, setStatus] = useState('');

    useEffect(() => {
        loadModelParameters().then(params => {
            setParameters(params);
        });
    }, []);

    const handleSaveParameters = async () => {
        try {
            await saveModelParameters(parameters);
            setStatus('Parameters saved successfully');
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            setStatus(`Error saving parameters: ${error.message}`);
        }
    };

    // Helper function to update parameters
    const updateParameter = (provider, param, value) => {
        setParameters(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [param]: value
            }
        }));
    };

    return (
        <div className="model-parameters-panel"
             style={{
                 backgroundColor: colors.background,
                 color: colors.text,
                 padding: '20px',
                 borderRadius: '8px'
             }}
        >
            <h3>Model Parameters</h3>

            {/* OpenAI Parameters */}
            <div className="provider-section" style={{ marginBottom: '20px' }}>
                <h4>OpenAI</h4>
                <div className="parameter-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="parameter-item">
                        <label htmlFor="openai-temperature">Temperature:</label>
                        <input
                            id="openai-temperature"
                            type="number"
                            min="0"
                            max="2"
                            step="0.1"
                            value={parameters.openai.temperature}
                            onChange={(e) => updateParameter('openai', 'temperature', parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Controls randomness (0-2)</small>
                    </div>

                    <div className="parameter-item">
                        <label htmlFor="openai-max-tokens">Max Tokens:</label>
                        <input
                            id="openai-max-tokens"
                            type="number"
                            min="1"
                            max="8192"
                            value={parameters.openai.max_tokens}
                            onChange={(e) => updateParameter('openai', 'max_tokens', parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Maximum tokens to generate</small>
                    </div>

                    <div className="parameter-item">
                        <label htmlFor="openai-top-p">Top P:</label>
                        <input
                            id="openai-top-p"
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            value={parameters.openai.top_p}
                            onChange={(e) => updateParameter('openai', 'top_p', parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Nucleus sampling (0-1)</small>
                    </div>

                    <div className="parameter-item">
                        <label htmlFor="openai-frequency-penalty">Frequency Penalty:</label>
                        <input
                            id="openai-frequency-penalty"
                            type="number"
                            min="-2"
                            max="2"
                            step="0.1"
                            value={parameters.openai.frequency_penalty}
                            onChange={(e) => updateParameter('openai', 'frequency_penalty', parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Penalize frequent tokens (-2 to 2)</small>
                    </div>

                    <div className="parameter-item">
                        <label htmlFor="openai-presence-penalty">Presence Penalty:</label>
                        <input
                            id="openai-presence-penalty"
                            type="number"
                            min="-2"
                            max="2"
                            step="0.1"
                            value={parameters.openai.presence_penalty}
                            onChange={(e) => updateParameter('openai', 'presence_penalty', parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Penalize new tokens (-2 to 2)</small>
                    </div>
                </div>
            </div>

            {/* Claude Parameters */}
            <div className="provider-section" style={{ marginBottom: '20px' }}>
                <h4>Claude</h4>
                <div className="parameter-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="parameter-item">
                        <label htmlFor="claude-temperature">Temperature:</label>
                        <input
                            id="claude-temperature"
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={parameters.claude.temperature}
                            onChange={(e) => updateParameter('claude', 'temperature', parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Controls randomness (0-1)</small>
                    </div>

                    <div className="parameter-item">
                        <label htmlFor="claude-max-tokens">Max Tokens:</label>
                        <input
                            id="claude-max-tokens"
                            type="number"
                            min="1"
                            max="100000"
                            value={parameters.claude.max_tokens}
                            onChange={(e) => updateParameter('claude', 'max_tokens', parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Maximum tokens to generate</small>
                    </div>

                    <div className="parameter-item">
                        <label htmlFor="claude-top-p">Top P:</label>
                        <input
                            id="claude-top-p"
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            value={parameters.claude.top_p}
                            onChange={(e) => updateParameter('claude', 'top_p', parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Nucleus sampling (0-1)</small>
                    </div>

                    <div className="parameter-item">
                        <label htmlFor="claude-top-k">Top K:</label>
                        <input
                            id="claude-top-k"
                            type="number"
                            min="1"
                            max="500"
                            value={parameters.claude.top_k}
                            onChange={(e) => updateParameter('claude', 'top_k', parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Limit vocabulary to top K tokens</small>
                    </div>
                </div>

                <div className="parameter-item" style={{ marginTop: '10px' }}>
                    <label htmlFor="claude-system-prompt">System Prompt:</label>
                    <textarea
                        id="claude-system-prompt"
                        value={parameters.claude.system_prompt}
                        onChange={(e) => updateParameter('claude', 'system_prompt', e.target.value)}
                        rows="3"
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.inputBg,
                            color: colors.text,
                            marginTop: '5px'
                        }}
                    />
                    <small>Custom system instructions for Claude</small>
                </div>
            </div>

            {/* Gemini Parameters */}
            <div className="provider-section" style={{ marginBottom: '20px' }}>
                <h4>Gemini</h4>
                <div className="parameter-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="parameter-item">
                        <label htmlFor="gemini-temperature">Temperature:</label>
                        <input
                            id="gemini-temperature"
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={parameters.gemini.temperature}
                            onChange={(e) => updateParameter('gemini', 'temperature', parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Controls randomness (0-1)</small>
                    </div>

                    <div className="parameter-item">
                        <label htmlFor="gemini-max-output-tokens">Max Output Tokens:</label>
                        <input
                            id="gemini-max-output-tokens"
                            type="number"
                            min="1"
                            max="8192"
                            value={parameters.gemini.max_output_tokens}
                            onChange={(e) => updateParameter('gemini', 'max_output_tokens', parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.inputBg,
                                color: colors.text
                            }}
                        />
                        <small>Maximum tokens to generate</small>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSaveParameters}
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
                Save Parameters
            </button>

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
    );
};

export default ModelParametersPanel;