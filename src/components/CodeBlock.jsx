import { useContext } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ThemeContext } from '../contexts/ThemeContext';
import styles from './CodeBlock.module.css';

const CodeBlock = ({ code, language }) => {
    const { darkMode } = useContext(ThemeContext);
    const themeStyle = darkMode ? atomDark : oneLight;
    const detectedLanguage = language || 'plaintext';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
                <span className={styles.codeLanguage}>{detectedLanguage}</span>
                <button
                    className={styles.copyButton}
                    onClick={handleCopy}
                    aria-label="Copy code to clipboard"
                >
                    Copy
                </button>
            </div>
            <SyntaxHighlighter
                language={detectedLanguage}
                style={themeStyle}
                customStyle={{
                    margin: 0,
                    padding: '12px 16px',
                    fontSize: '0.9em',
                    borderRadius: '0 0 4px 4px',
                    backgroundColor: 'transparent',
                }}
                codeTagProps={{
                    style: { fontFamily: 'monospace' }
                }}
                wrapLongLines={true}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeBlock;