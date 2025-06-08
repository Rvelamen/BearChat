// Message types
export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
  output?: any;
}

export interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  tool_name?: string;
  isProcessingTools?: boolean;
  isErrorToolCall?: boolean;
  processingChatResponse?: boolean;
  toolResults?: string;
  toolResponses?: any[];
  tool_call?: ToolCall;
  tool_response?: any;
}

export interface Chat {
  title: string;
  messages: Message[];
}

// Model configuration
export interface ModelConfig {
  base_url: string;
  api_key: string;
  model: string;
  temperature: number;
}

// Tool definitions
export interface Tool {
  id: string;
  name: string;
  description: string;
  server_name: string;
  inputSchema?: any;
  input_schema?: any;
}

export interface ToolsConfig {
  endpoint_url: string;
  execution_url: string;
}

export interface ModelOption {
  id: string;
  name: string;
}

// Store state
export interface ChatState {
  chatHistory: Chat[];
  currentChatIndex: number;
  displayMessages: Message[][];
  modelConfig: ModelConfig;
  toolsConfig: ToolsConfig;
  availableTools: Record<string, Tool[]>;
  serversStatus: Record<string, { status: boolean; error: string | null }>;
  toolsIdMaps: Record<string, Tool>;
  toolsNameMaps: Record<string, string>;
  selectedTools: string[];
  
  // Actions
  addChat: () => void;
  deleteChat: (index: number) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageIndex: number, message: Message) => void;
  updateDisplayMessages: () => void;
  setCurrentChatIndex: (index: number) => void;
  setModelConfig: (config: ModelConfig) => void;
  setToolsConfig: (config: ToolsConfig) => void;
  setAvailableTools: (tools: Record<string, Tool[]>) => void;
  setServersStatus: (status: Record<string, { status: boolean; error: string | null }>) => void;
  setToolsIdMaps: (maps: Record<string, Tool>) => void;
  setToolsNameMaps: (maps: Record<string, string>) => void;
  setSelectedTools: (tools: string[]) => void;
} 