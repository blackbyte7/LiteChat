import { useState } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ChatProvider } from '../contexts/ChatContext';
import ChatInterface from './ChatInterface';
import ChatControls from './ChatControls';
import SettingsPanel from './SettingsPanel';

const App = () => {
    const [view, setView] = useState('chat');

    return (
        <ThemeProvider>
            <ChatProvider>
                <div className="app-container"
                     style={{
                         width: '100%',
                         height: '100%',
                         display: 'flex',
                         flexDirection: 'column'
                     }}
                >
                    <div className="app-header"
                         style={{
                             display: 'flex',
                             justifyContent: 'space-between',
                             alignItems: 'center',
                             padding: '12px 16px',
                             borderBottom: '1px solid #e0e0e0'
                         }}
                    >
                        <h1 style={{ margin: 0, fontSize: '18px' }}>Universal LLM Chat</h1>
                        <div>
                            <button
                                onClick={() => setView(view === 'chat' ? 'settings' : 'chat')}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {view === 'chat' ? 'Settings' : 'Chat'}
                            </button>
                        </div>
                    </div>

                    {view === 'chat' ? (
                        <div className="chat-container"
                             style={{
                                 display: 'flex',
                                 flex: 1,
                                 overflow: 'hidden'
                             }}
                        >
                            <ChatControls />
                            <ChatInterface />
                        </div>
                    ) : (
                        <SettingsPanel />
                    )}
                </div>
            </ChatProvider>
        </ThemeProvider>
    );
};

export default App;