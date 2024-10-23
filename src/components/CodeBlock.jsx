import{ useContext } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ThemeContext } from '../contexts/ThemeContext';

const CodeBlock = ({ code, language }) => {
    const { darkMode } = useContext(ThemeContext);
    const style = darkMode ? tomorrow : prism;

    return (
        <div className="code-block">
            <div className="code-header">
                <span className="code-language">{language || 'code'}</span>
                <button
                    className="copy-button"
                    onClick={() => navigator.clipboard.writeText(code)}
                >
                    Copy
                </button>
            </div>
            <SyntaxHighlighter
                language={language || 'javascript'}
                style={style}
                customStyle={{
                    borderRadius: '0 0 4px 4px',
                    margin: 0,
                    fontSize: '14px',
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeBlock;