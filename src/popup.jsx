import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import styles from './popup.module.css';
import './contexts/Theme.module.css';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root');
    if (!container) {
        console.error("Fatal: Root element not found for popup.");
        return;
    }
    const root = createRoot(container);
    container.classList.add(styles.popupRoot);

    root.render(
        <StrictMode>
            <App />
        </StrictMode>
    );
});
document.body.classList.add(styles.popupBody);