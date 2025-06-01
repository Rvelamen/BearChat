import axios from 'axios';
import { Message, ModelConfig, ToolCall } from '../types';
import { message } from 'antd';

// Tool API calls
export const fetchTools = async (endpointUrl: string) => {
  try {
    const response = await axios.get(endpointUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw error;
  }
};

export const executeToolCall = async (executionUrl: string, toolCallData: any) => {
  try {
    const response = await axios.post(executionUrl, toolCallData);
    return response.data;
  } catch (error) {
    message.error('Tool execution error:', error);
    throw error;
  }
};

// Get tool execution URL
export const getExecutionUrlForTool = (
  toolId: string, 
  toolsIdMaps: Record<string, any>, 
  executionBaseUrl: string
) => {
  if (toolsIdMaps[toolId]) {
    const tool = toolsIdMaps[toolId];
    return `${executionBaseUrl}/${tool.server_name}?tool_name=${tool.name}`;
  }
  return null;
};

// Type definition for the streaming handler
interface StreamHandlers {
  onContent: (content: string) => void;
  onToolCall: (index: number, toolCall: Partial<ToolCall>) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

// Send a message to the LLM API
export const sendMessageToLLM = async (
  messages: Message[],
  modelConfig: ModelConfig,
  tools: any[] = [],
  handlers: StreamHandlers
) => {
  try {
    const apiMessages = messages.map(msg => {
      if (msg.role === 'tool') {
        return {
          role: 'tool',
          tool_call_id: msg.tool_call_id,
          content: msg.content,
        };
      }

      if (msg.role === 'assistant') {
        const assistantMsg: any = {
          role: 'assistant',
          content: msg.content || '',
        };

        if (msg.tool_calls && msg.tool_calls.length > 0) {
          assistantMsg.tool_calls = msg.tool_calls.map(call => ({
            id: call.id,
            type: call.type || 'function',
            function: {
              name: call.function.name,
              arguments: call.function.arguments,
            },
          }));
        }

        return assistantMsg;
      }

      return {
        role: msg.role,
        content: msg.content,
      };
    });

    const requestParams: any = {
      model: modelConfig.model,
      messages: apiMessages.slice(0, -1),
      temperature: modelConfig.temperature,
      stream: true,
    };

    if (tools.length > 0) {
      requestParams.tools = tools;
      requestParams.tool_choice = 'auto';
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${modelConfig.api_key}`,
    };

    const response = await fetch(`${modelConfig.base_url}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestParams),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullContent = '';
    const currentToolCalls: Partial<ToolCall>[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process the buffer line by line
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

      for (const line of lines) {
        if (!line.trim() || line.trim() === 'data: [DONE]') continue;

        try {
          // Extract the JSON data from the SSE format
          const jsonData = line.replace(/^data: /, '').trim();
          if (!jsonData) continue;

          const parsed = JSON.parse(jsonData);
          const delta = parsed.choices[0]?.delta;

          // Add content if present
          if (delta.content) {
            fullContent += delta.content;
            handlers.onContent(fullContent);
          }

          // Handle tool calls if present
          if (delta.tool_calls && delta.tool_calls.length > 0) {
            for (const toolCallDelta of delta.tool_calls) {
              const index = toolCallDelta.index;

              // Initialize tool call if not already there
              if (!currentToolCalls[index]) {
                currentToolCalls[index] = {
                  id: toolCallDelta.id || '',
                  type: 'function',
                  function: {
                    name: '',
                    arguments: '',
                  },
                };
              }

              // Update tool call with new delta information
              if (toolCallDelta.id) {
                currentToolCalls[index].id = toolCallDelta.id;
              }

              if (toolCallDelta.function) {
                if (toolCallDelta.function.name) {
                  currentToolCalls[index].function.name += toolCallDelta.function.name;
                }
                if (toolCallDelta.function.arguments) {
                  currentToolCalls[index].function.arguments += toolCallDelta.function.arguments;
                }
              }

              handlers.onToolCall(index, currentToolCalls[index]);
            }
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err, line);
        }
      }
    }

    handlers.onComplete();
    return { content: fullContent, toolCalls: currentToolCalls };
  } catch (error) {
    handlers.onError(error as Error);
    throw error;
  }
}; 