import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        chrome.storage.sync.get('darkMode', (result) => {
            if (result.darkMode !== undefined) {
                setDarkMode(result.darkMode);
            }
        });
    }, []);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        chrome.storage.sync.set({ darkMode: newMode });
    };

    const theme = {
        darkMode,
        toggleTheme,
        colors: darkMode
            ? {
                background: '#1a1a1a',
                text: '#f5f5f5',
                primary: '#4d8cf5',
                secondary: '#2d2d2d',
                border: '#444444',
                messageBg: '#2d2d2d',
                userMessageBg: '#2b5797',
                inputBg: '#333333',
            }
            : {
                background: '#ffffff',
                text: '#333333',
                primary: '#4285f4',
                secondary: '#f9f9f9',
                border: '#e0e0e0',
                messageBg: '#f5f5f5',
                userMessageBg: '#e3f2fd',
                inputBg: '#ffffff',
            },
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};