import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';
import SettingsPanel from './components/SettingsPanel';
import styles from './options.module.css';
import './contexts/Theme.module.css';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root');
    if (!container) {
        console.error("Fatal: Root element not found for options page.");
        return;
    }
    const root = createRoot(container);
    root.render(
        <ThemeProvider>
            <div className={styles.optionsContainer}>
                <SettingsPanel />
            </div>
        </ThemeProvider>
    );
});