# LiteChat - Universal LLM Chat Chrome Extension

<p align="center">
  <img src="./public/vite.svg" alt="LiteChat Logo" width="150" height="150" />
</p>

<h3 align="center">A lightweight universal UI for chatting with LLMs like Claude, OpenAI, and Gemini.</h3>

<p align="center">
  <a href="https://github.com/your-github-username/LiteChat/issues">
    <img src="https://img.shields.io/github/issues/your-github-username/LiteChat" alt="Issues">
  </a>
  <a href="https://github.com/your-github-username/LiteChat/pulls">
    <img src="https://img.shields.io/github/pulls/your-github-username/LiteChat" alt="Pull Requests">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  </a>
</p>

<br />

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Keys Setup](#api-keys-setup)
- [Model Parameter Tuning](#model-parameter-tuning)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

- **Universal LLM Support:** Chat with multiple powerful language models in one place, including:
- **OpenAI:** GPT-4o, GPT-4o mini, o3 Mini
- **Anthropic:** Claude 3 Opus, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3.7 Sonnet
- **Google:** Gemini 1.5 Pro, Gemini 2.0 Pro, Gemini 2.0 Flash
- **Chat History:** Your conversations are saved locally, allowing you to revisit and continue previous chats.
- **Model Selection:** Easily switch between different models and providers for each new chat.
- **Image Attachment:** Send images in your chat conversations (supported by models that offer vision capabilities like GPT-4o, Gemini Pro and Claude 3.5 models).
- **Code Block Rendering:** Code snippets in messages are beautifully rendered with syntax highlighting and a convenient copy button.
- **Message Editing:** Correct typos or refine your prompts by editing your sent messages.
- **Customizable Model Parameters:** Fine-tune model behavior by adjusting parameters like temperature, maximum tokens, and more for each provider (OpenAI, Claude, Gemini).
- **Light and Dark Themes:** Choose between a light and dark theme to suit your visual preferences.
- **Settings Page:** Dedicated options page to manage API keys and model parameters.
- **Lightweight & Fast:** Designed to be a fast and efficient Chrome Extension, providing a smooth chat experience.

## Screenshots

<!-- You can add screenshots or GIFs here to showcase your extension in action -->
<!-- Example: -->
<!--
<p align="center">
  <img src="./screenshots/screenshot-1.png" alt="Chat Interface" width="800" />
  <br />
  <em>Chat Interface with Message Bubbles and Input Area</em>
</p>

<p align="center">
  <img src="./screenshots/screenshot-2.png" alt="Settings Panel" width="800" />
  <br />
  <em>Settings Panel with API Key Configuration and Theme Toggle</em>
</p>
-->

**[Add screenshots of your extension here - Chat Interface, Settings Panel, etc.]**

## Technologies Used

- **React:** For building the user interface components.
- **Vite:**  For fast development and building the extension.
- **JavaScript (ES Modules):** Modern JavaScript for extension logic.
- **Chrome Extension APIs:**  For browser integration and extension functionalities.
- **react-syntax-highlighter:** For syntax highlighting in code blocks.
- **eslint:** For JavaScript code linting and maintaining code quality.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-github-username/LiteChat.git
   cd LiteChat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Install the extension in Chrome:**
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable "Developer mode" in the top right corner.
    - Click "Load unpacked" in the top left corner.
    - Select the `dist` folder from your cloned repository.

   LiteChat extension should now be installed in your Chrome browser.

## Usage

1. **Open the extension popup:** Click on the LiteChat icon in your Chrome toolbar.

2. **Start a new chat:**
    - Click the "New Chat" button in the left sidebar.
    - A dropdown menu will appear, allowing you to select a provider (OpenAI, Claude, Gemini) and a specific model.
    - Choose your desired model to start a new conversation.

3. **Chatting:**
    - Type your message in the input area at the bottom of the chat interface.
    - Press "Send" or `Enter` to send your message.
    - The response from the LLM will appear in the chat interface.

4. **Image Attachment (if supported by the model):**
    - Click the "Attach Image" button in the input area.
    - Select an image file from your computer.
    - Your message and the attached image will be sent to the LLM.

5. **View Chat History:**
    - Your previous chats are listed in the left sidebar.
    - Click on a chat title to reopen and continue the conversation.

6. **Delete a Chat:**
    - Hover over a chat title in the sidebar.
    - Click the "×" button that appears to the right of the chat title to delete the chat.
    - Confirm the deletion when prompted.

7. **Access Settings:**
    - Click the "Settings" button in the top right corner of the popup to access the settings panel.

## Configuration

You can configure LiteChat through the settings panel, accessible via the "Settings" button in the popup or by right-clicking the extension icon and selecting "Options".

### API Keys Setup

To use the LLM providers, you need to provide your API keys:

1. **Navigate to Settings:** Open the LiteChat settings panel.
2. **API Keys Section:** Locate the "API Keys" section under the "General" tab.
3. **Enter API Keys:**
    - **OpenAI API Key:** Enter your OpenAI API key. You can obtain one from the [OpenAI API dashboard](https://platform.openai.com/api-keys).
    - **Claude API Key:** Enter your Claude API key. You can obtain one from the [Anthropic Console](https://console.anthropic.com/).
    - **Gemini API Key:** Enter your Gemini API key. You can obtain one from the [Google AI Studio](https://makersuite.google.com/app/apikey).
4. **Save API Keys:** Click the "Save Keys" button to store your API keys securely in your browser's storage.

**Important Security Note:** API keys are stored locally in your browser's storage and are not transmitted to any external servers by the LiteChat extension. However, it's crucial to keep your API keys secure and avoid sharing them publicly.

### Model Parameter Tuning

Customize the behavior of each LLM model by adjusting parameters:

1. **Navigate to Settings:** Open the LiteChat settings panel.
2. **Model Parameters Tab:** Click on the "Model Parameters" tab.
3. **Adjust Parameters:**
    - **OpenAI Parameters:**
        - **Temperature:** Controls the randomness of the output (0.0 - 2.0). Lower values are more deterministic, higher values are more random.
        - **Max Tokens:**  Maximum number of tokens the model should generate in the response.
        - **Top P:** Nucleus sampling, controls diversity via probability cutoff (0.0 - 1.0).
        - **Frequency Penalty:** Penalizes repeated tokens, reducing redundancy (-2.0 - 2.0).
        - **Presence Penalty:** Penalizes new tokens based on their presence in the text, encouraging new topics (-2.0 - 2.0).
    - **Claude Parameters:**
        - **Temperature:** Controls randomness (0.0 - 1.0).
        - **Max Tokens:** Maximum tokens to generate.
        - **Top P:** Nucleus sampling (0.0 - 1.0).
        - **Top K:** Limits vocabulary to the top K most likely tokens.
        - **System Prompt:** Custom instructions for the Claude model to guide its behavior.
    - **Gemini Parameters:**
        - **Temperature:** Controls randomness (0.0 - 1.0).
        - **Max Output Tokens:** Maximum tokens to generate.
4. **Save Parameters:** Click the "Save Parameters" button to apply your customized model settings.

Experiment with these parameters to find the optimal settings for your desired chat experience with each model.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgements

- This project utilizes the [React](https://reactjs.org/) library.
- Built with [Vite](https://vitejs.dev/).
- Syntax highlighting provided by [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter).
- Icons from [Vite](https://vitejs.dev/) and [React](https://reactjs.org/).

---

**Enjoy chatting with LiteChat!**
