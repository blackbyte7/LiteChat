import { createContext, useState, useEffect } from 'react';
import { STORAGE_KEY_DARK_MODE } from '../constants';
import styles from './Theme.module.css';

export const ThemeContext = createContext();

const lightColors = {
    background: '#ffffff',
    text: '#333333',
    primary: '#4285f4',
    secondary: '#f1f3f4',
    border: '#e0e0e0',
    messageBg: '#f1f3f4',
    userMessageBg: '#d0e4ff',
    inputBg: '#ffffff',
    codeBg: '#f5f5f5',
    codeText: '#333',
    shadow: 'rgba(0, 0, 0, 0.1)',
    errorBg: '#ffdddd',
    errorText: '#D8000C',
    successBg: '#ddffdd',
    successText: '#4F8A10',
    linkColor: '#0366d6',
    buttonText: '#ffffff',
    secondaryButtonBg: '#e0e0e0',
    secondaryButtonText: '#333333',
    loadingSpinner: '#4285f4',
};

const darkColors = {
    background: '#202124',
    text: '#e8eaed',
    primary: '#8ab4f8',
    secondary: '#2d2d2d',
    border: '#3c4043',
    messageBg: '#303134',
    userMessageBg: '#3c4043',
    inputBg: '#303134',
    codeBg: '#2d2d2d',
    codeText: '#e8eaed',
    shadow: 'rgba(0, 0, 0, 0.3)',
    errorBg: '#5f2120',
    errorText: '#f4c7c7',
    successBg: '#2e5737',
    successText: '#d3f3d8',
    linkColor: '#8ab4f8',
    buttonText: '#202124',
    secondaryButtonBg: '#3c4043',
    secondaryButtonText: '#e8eaed',
    loadingSpinner: '#8ab4f8',
};


export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Set initial theme based on storage or system preference
        chrome.storage.sync.get(STORAGE_KEY_DARK_MODE, (result) => {
            const storedValue = result[STORAGE_KEY_DARK_MODE];
            if (storedValue !== undefined) {
                setDarkMode(storedValue);
            } else {
                // Fallback to system preference if no value is stored
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                setDarkMode(prefersDark);
                // Optionally save the detected preference
                chrome.storage.sync.set({ [STORAGE_KEY_DARK_MODE]: prefersDark });
            }
        });

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // Only update if storage hasn't been explicitly set
            chrome.storage.sync.get(STORAGE_KEY_DARK_MODE, (result) => {
                if (result[STORAGE_KEY_DARK_MODE] === undefined) {
                    setDarkMode(e.matches);
                }
            });
        };
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);

    }, []);

    useEffect(() => {
        // Apply theme variables to the root element
        const currentColors = darkMode ? darkColors : lightColors;
        const root = document.documentElement; // Target the root for global scope

        for (const [key, value] of Object.entries(currentColors)) {
            // Convert camelCase to kebab-case for CSS variable names
            const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVarName, value);
        }
        // Add a class for CSS rules that depend on the theme
        root.classList.toggle(styles.darkMode, darkMode);
        root.classList.toggle(styles.lightMode, !darkMode);

    }, [darkMode]);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        chrome.storage.sync.set({ [STORAGE_KEY_DARK_MODE]: newMode });
    };

    const theme = {
        darkMode,
        toggleTheme,
        colors: darkMode ? darkColors : lightColors, // Keep colors object for direct access if needed
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};