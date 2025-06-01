# React Tool Chatbot

A modern React implementation of a chatbot interface with LLM tool calling capabilities.

## Features

- Chat interface with message history
- Support for LLM models like GPT-4o, DeepSeek, GLM-4-Flash
- Dynamic tool calling support
- Tool execution and response handling
- Settings management for API keys and endpoints
- Chat history management with persistence
- Markdown and code highlighting support
- Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 14+ and npm/yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/react-tool-chatbot.git
cd react-tool-chatbot
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at http://localhost:3000.

## Configuration

### Model Settings

The application supports various LLM models. Configure your API settings:

1. Click the "Settings" button in the sidebar
2. Select the "Model Configuration" tab
3. Choose your preferred model (GPT-4o-mini, deepseek-chat, GLM-4-Flash)
4. Enter your API key and base URL
5. Adjust temperature as needed

### Tool Settings

To use AI tools:

1. Go to the "Tool Configuration" tab in settings
2. Set up the tool endpoint and execution URLs
3. Click "Fetch Available Tools" to load available tools
4. Select the tools you want to use
5. Enable the "Use Tools" toggle when chatting

## Usage

1. Type your message in the input field and press Enter or click the send button
2. If tools are enabled, the AI may choose to use them
3. Tool calls and results will be displayed in the chat
4. Continue the conversation as normal

## Project Structure

```
src/
  ├── components/     # React components
  │   ├── chat/       # Chat-related components
  │   ├── layout/     # Layout components
  │   └── settings/   # Settings components
  ├── store/          # Zustand state management
  ├── types/          # TypeScript type definitions
  ├── utils/          # Utility functions
  ├── App.tsx         # Main App component
  └── index.tsx       # Entry point
```

## License

MIT 