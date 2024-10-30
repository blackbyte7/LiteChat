import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';
import SettingsPanel from './components/SettingsPanel';
import './options.css';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(
        <ThemeProvider>
            <div style={{ padding: '20px' }}>
                <h1>LLM Chat Settings</h1>
                <SettingsPanel />
            </div>
        </ThemeProvider>
    );
});