import React, { useRef, useState, useEffect } from "react";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import { useChatStore } from "../../store/chatStore";
import {
  sendMessageToLLM,
  getExecutionUrlForTool,
  executeToolCall,
} from "../../utils/api";
import { Message, ToolCall } from "../../types";
import { safeJsonParse } from "../../utils/helpers";

const ChatContainer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [useTools, setUseTools] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    displayMessages,
    addMessage,
    updateMessage,
    chatHistory,
    currentChatIndex,
    modelConfig,
    toolsConfig,
    toolsIdMaps,
    toolsNameMaps,
    selectedTools,
  } = useChatStore();

  useEffect(() => {
    useChatStore.getState().updateDisplayMessages();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
    // console.log("messages: ", chatHistory[currentChatIndex].messages);
    // console.log("displayMessages: ", displayMessages);
  }, [displayMessages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: userInput.trim(),
    };

    addMessage(userMessage);
    setUserInput("");
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantPlaceholder: Message = {
      role: "assistant",
      content: "",
    };
    addMessage(assistantPlaceholder);

    // Get the current chat's messages
    const messages = chatHistory[currentChatIndex].messages;
    const messageIndex = messages.length - 1;

    try {
      // Prepare tools if enabled
      const tools = [];
      if (useTools && selectedTools.length > 0) {
        for (const toolId of selectedTools) {
          const [serverName, toolName] = toolId.split("/");
          const availableTools = useChatStore.getState().availableTools;

          if (availableTools[serverName]) {
            const toolData = availableTools[serverName].find(
              (tool) => tool.name === toolName
            );

            if (toolData) {
              tools.push({
                type: "function",
                function: {
                  name: toolsNameMaps[toolId],
                  description: toolData.description,
                  parameters: toolData.inputSchema || toolData.input_schema,
                },
              });
            }
          }
        }
      }

      // Stream handlers
      const handlers = {
        onContent: (content: string) => {
          // Update assistant message with new content
          const newMessage = { ...assistantPlaceholder, content };
          updateMessage(messageIndex, newMessage);
        },
        onToolCall: (index: number, toolCall: Partial<ToolCall>) => {
          // Update assistant message with tool calls
          const currentAssistantMessage = { ...assistantPlaceholder };

          if (!currentAssistantMessage.tool_calls) {
            currentAssistantMessage.tool_calls = [];
          }

          // Create or update tool call
          if (!currentAssistantMessage.tool_calls[index]) {
            currentAssistantMessage.tool_calls[index] = toolCall as ToolCall;
          } else {
            currentAssistantMessage.tool_calls[index] = {
              ...currentAssistantMessage.tool_calls[index],
              ...toolCall,
            };
          }

          currentAssistantMessage.isProcessingTools = true;
          updateMessage(messageIndex, currentAssistantMessage);
        },
        onComplete: () => {
          // Mark completion in the final message
          const finalMessage =
            useChatStore.getState().chatHistory[currentChatIndex].messages[
              messageIndex
            ];
          if (finalMessage.role === "assistant") {
            finalMessage.isProcessingTools =
              finalMessage.tool_calls && finalMessage.tool_calls.length > 0;
            updateMessage(messageIndex, finalMessage);
          }
        },
        onError: (error: Error) => {
          console.error("Error in message stream:", error);
          updateMessage(messageIndex, {
            role: "assistant",
            content: `发生错误: ${error.message || "未知错误"}`,
          });
        },
      };

      // Send message to LLM
      const response = await sendMessageToLLM(
        messages,
        modelConfig,
        tools,
        handlers
      );

      // Process tool calls if any
      if (response.toolCalls && response.toolCalls.length > 0) {
        await processToolCalls(messageIndex, response.toolCalls as ToolCall[]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      updateMessage(messageIndex, {
        role: "assistant",
        content: `发生错误: ${error.message || "未知错误"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Process tool calls and tool responses
  const processToolCalls = async (
    messageIndex: number,
    toolCalls: ToolCall[]
  ) => {
    try {
      for (let i = 0; i < toolCalls.length; i++) {
        const toolCall = toolCalls[i];
        try {
          // Get the execution URL for this tool
          const executionUrl = getExecutionUrlForTool(
            toolCall.function.name,
            toolsIdMaps,
            toolsConfig.execution_url
          );

          if (!executionUrl) {
            throw new Error(`Tool not found: ${toolCall.function.name}`);
          }

          // Parse tool arguments
          const toolCallArgs = safeJsonParse(toolCall.function.arguments) || {};

          // Execute tool call
          const toolResult = await executeToolCall(executionUrl, toolCallArgs);

          addMessage({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        } catch (toolError) {
          console.error("Tool execution error:", toolError);

          const errorMessage =
            toolError.response?.data?.detail || "Tool execution failed";

          addMessage({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: errorMessage }),
            isProcessingTools: false
          });
        }
      }

      // Continue with tool results
      await continueWithToolResults();
    } catch (error) {
      console.error("Error processing tool calls:", error);

      // Update message to show error
      const assistantMessage =
        useChatStore.getState().chatHistory[currentChatIndex].messages[
          messageIndex
        ];
      if (assistantMessage.role === "assistant") {
        assistantMessage.isProcessingTools = false;
        assistantMessage.processingChatResponse = false;
        assistantMessage.toolResults = `发生错误: ${
          error.message || "未知错误"
        }`;
        updateMessage(messageIndex, assistantMessage);
      }
    }
  };

  // Continue the conversation with tool results
  const continueWithToolResults = async () => {
    // Create placeholder for assistant response
    const assistantPlaceholder: Message = {
      role: "assistant",
      content: "",
    };
    addMessage(assistantPlaceholder);

    // Get the current chat's messages
    const messages = chatHistory[currentChatIndex].messages;
    const messageIndex = messages.length - 1;
    try {
      // Prepare tools
      const tools = [];
      if (useTools && selectedTools.length > 0) {
        for (const toolId of selectedTools) {
          const [serverName, toolName] = toolId.split("/");
          const availableTools = useChatStore.getState().availableTools;

          if (availableTools[serverName]) {
            const toolData = availableTools[serverName].find(
              (tool) => tool.name === toolName
            );

            if (toolData) {
              tools.push({
                type: "function",
                function: {
                  name: toolsNameMaps[toolId],
                  description: toolData.description,
                  parameters: toolData.inputSchema || toolData.input_schema,
                },
              });
            }
          }
        }
      }

      // Update the assistant message for streaming
      const assistantMessage =
        useChatStore.getState().chatHistory[currentChatIndex].messages[
          messageIndex
        ];

      // Stream handlers
      const handlers = {
        onContent: (content: string) => {
          // Update assistant message with new content
          const newMessage = { ...assistantMessage, content };
          updateMessage(messageIndex, newMessage);
        },
        onToolCall: (index: number, toolCall: Partial<ToolCall>) => {
          // Update assistant message with tool calls
          const currentAssistantMessage = { ...assistantMessage };

          if (!currentAssistantMessage.tool_calls) {
            currentAssistantMessage.tool_calls = [];
          }

          // Create or update tool call
          if (!currentAssistantMessage.tool_calls[index]) {
            currentAssistantMessage.tool_calls[index] = toolCall as ToolCall;
          } else {
            currentAssistantMessage.tool_calls[index] = {
              ...currentAssistantMessage.tool_calls[index],
              ...toolCall,
            };
          }

          currentAssistantMessage.isProcessingTools = true;
          updateMessage(messageIndex, currentAssistantMessage);
        },
        onComplete: () => {
          // Mark completion in the final message
          const finalMessage =
            useChatStore.getState().chatHistory[currentChatIndex].messages[
              messageIndex
            ];
          if (finalMessage.role === "assistant") {
            finalMessage.isProcessingTools =
              finalMessage.tool_calls && finalMessage.tool_calls.length > 0;
            updateMessage(messageIndex, finalMessage);
          }
        },
        onError: (error: Error) => {
          console.error("Error in message stream:", error);
          updateMessage(messageIndex, {
            role: "assistant",
            content: `发生错误: ${error.message || "未知错误"}`,
          });
        },
      };

      // Send message to LLM with tool results
      const response = await sendMessageToLLM(
        messages,
        modelConfig,
        tools,
        handlers
      );

      // Process tool calls if any
      if (response.toolCalls && response.toolCalls.length > 0) {
        await processToolCalls(messageIndex, response.toolCalls as ToolCall[]);
      }
    } catch (error) {
      console.error("Error continuing with tool results:", error);
      updateMessage(messageIndex, {
        role: "assistant",
        content: `发生错误: ${error.message || "未知错误"}`,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="messages-container" ref={messagesContainerRef}>
        <div className="max-w-5xl mx-auto w-full h-full">
          <MessageList
            messages={displayMessages}
            isLoading={isLoading}
            toolsIdMaps={toolsIdMaps}
          />
        </div>
      </div>

      <div className="input-area">
        <div className="max-w-5xl mx-auto w-full">
          <InputArea
            value={userInput}
            onChange={setUserInput}
            onSubmit={handleSendMessage}
            disabled={isLoading}
            useTools={useTools}
            onToggleTools={(value) => setUseTools(value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
