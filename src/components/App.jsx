import { useState, useContext } from 'react';
import { ThemeProvider, ThemeContext } from '../contexts/ThemeContext';
import { ChatProvider } from '../contexts/ChatContext';
import ChatInterface from './ChatInterface';
import ChatControls from './ChatControls';
import SettingsPanel from './SettingsPanel';
import styles from './App.module.css';

const AppContent = () => {
    const [view, setView] = useState('chat');
    const { darkMode } = useContext(ThemeContext);

    return (
        <div className={`${styles.appContainer} ${darkMode ? styles.dark : styles.light}`}>
            <div className={styles.appHeader}>
                <h1 className={styles.appTitle}>LiteChat</h1>
                <button
                    onClick={() => setView(view === 'chat' ? 'settings' : 'chat')}
                    className={styles.toggleViewButton}
                    aria-label={view === 'chat' ? 'Go to Settings' : 'Go to Chat'}
                >
                    {view === 'chat' ? 'Settings' : 'Chat'}
                </button>
            </div>
            {view === 'chat' ? (
                <div className={styles.chatLayout}>
                    <ChatControls />
                    <ChatInterface />
                </div>
            ) : (
                <div className={styles.settingsLayout}>
                    <SettingsPanel />
                </div>
            )}
        </div>
    );
}

const App = () => {
    return (
        <ThemeProvider>
            <ChatProvider>
                <AppContent />
            </ChatProvider>
        </ThemeProvider>
    );
};

export default App;