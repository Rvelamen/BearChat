import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { ChatState, Message, Tool } from "../types";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chatHistory: [],
      currentChatIndex: 0,
      displayMessages: [],
      modelConfig: {
        base_url: "https://api.deepseek.com/v1",
        api_key: "sk-",
        model: "deepseek-chat",
        temperature: 0.7,
      },
      toolsConfig: {
        endpoint_url: "/api/mcp/list-tools",
        execution_url: "/api/mcp/call-tool",
      },
      availableTools: {},
      serversStatus: {},
      toolsIdMaps: {},
      toolsNameMaps: {},
      selectedTools: [],

      // Actions
      addChat: () => {
        set((state) => {
          const newHistory = [
            ...state.chatHistory,
            {
              title: "新对话",
              messages: [],
            },
          ];
          return {
            chatHistory: newHistory,
            displayMessages: [],
            currentChatIndex: newHistory.length - 1,
          };
        });
      },

      deleteChat: (index) => {
        set((state) => {
          const newHistory = [...state.chatHistory];
          newHistory.splice(index, 1);

          // If we deleted all chats, create a new one
          if (newHistory.length === 0) {
            newHistory.push({
              title: "新对话",
              messages: [],
            });
          }

          // Adjust current index if needed
          let newIndex = state.currentChatIndex;
          if (newIndex >= newHistory.length) {
            newIndex = newHistory.length - 1;
          }

          return {
            chatHistory: newHistory,
            currentChatIndex: newIndex,
          };
        });

        // Update displayed messages
        get().updateDisplayMessages();
      },
      updateMessage: (messageIndex, message) => {
        set((state) => {
          const newHistory = [...state.chatHistory];
          newHistory[state.currentChatIndex].messages[messageIndex] = message;
          get().updateDisplayMessages();
          return { chatHistory: newHistory };
        });
      },
      addMessage: (message) => {
        set((state) => {
          if (state.chatHistory.length === 0) {
            return {
              chatHistory: [
                {
                  title: "新对话",
                  messages: [message],
                },
              ],
              currentChatIndex: 0,
            };
          }

          const newHistory = [...state.chatHistory];
          newHistory[state.currentChatIndex].messages.push(message);

          // Set the chat title based on first user message
          if (
            message.role === "user" &&
            newHistory[state.currentChatIndex].messages.filter(
              (m) => m.role === "user"
            ).length === 1
          ) {
            const title =
              message.content.substring(0, 15) +
              (message.content.length > 15 ? "..." : "");
            newHistory[state.currentChatIndex].title = title;
          }

          get().updateDisplayMessages();

          return {
            chatHistory: newHistory,
          };
        });
      },
      updateDisplayMessages: () => {
        set((state) => {
          if (
            state.chatHistory.length === 0 ||
            !state.chatHistory[state.currentChatIndex]
          ) {
            return { displayMessages: [] };
          }
          const apiMessages =
            state.chatHistory[state.currentChatIndex].messages;
          const newDisplayMessages: Message[][] = [];

          for (let i = 0; i < apiMessages.length; i++) {
            const msg = apiMessages[i];
            if (
              msg.role === "user" ||
              (msg.role === "assistant" &&
                (!msg.tool_calls || msg.tool_calls.length === 0))
            ) {
              newDisplayMessages.push([{ ...msg }]);
            } else if (
              msg.role === "assistant" &&
              msg.tool_calls &&
              msg.tool_calls.length > 0
            ) {
              const msgs: Message[] = [];
              const displayMsg = { ...msg };
              // 记录tool 调用的UI的位置， 方便后续插入结果
              const tool_map_in_display = {};
              for (let tool_call of displayMsg.tool_calls) {
                msgs.push({
                  role: "tool",
                  content: "",
                  tool_call: tool_call,
                  isProcessingTools: true,
                });
                tool_map_in_display[tool_call.id] = msgs.length - 1;
              }

              let j = i + 1;
              while (j < apiMessages.length) {
                const msg = apiMessages[j];
                if (msg.role === "tool") {
                  const tool = {
                    tool_response: {
                      tool_call_id: msg.tool_call_id,
                      content: msg.content,
                      isErrorToolCall: msg.isErrorToolCall
                    },
                    isProcessingTools: false,
                  };
                  const tool_index = tool_map_in_display[msg.tool_call_id];
                  msgs[tool_index] = {
                    ...msgs[tool_index],
                    ...tool,
                  };
                } else if (
                  msg.role === "assistant" &&
                  msg.tool_calls &&
                  msg.tool_calls.length > 0
                ) {
                  for (let tool_call of msg.tool_calls) {
                    msgs.push({
                      role: "tool",
                      content: "",
                      tool_call: tool_call,
                      isProcessingTools: true,
                    });
                    tool_map_in_display[tool_call.id] = msgs.length - 1;
                  }
                } else if (msg.role == "assistant") {
                  msgs.push(msg);
                } else {
                  break;
                }
                j++;
              }
              if (msgs.length > 0) {
                newDisplayMessages.push(msgs);
              }
              i = j + 1;
            } else if (msg.role === "tool") {
              continue;
            }
          }

          return { displayMessages: newDisplayMessages };
        });
      },

      setCurrentChatIndex: (index) => {
        set({ currentChatIndex: index });
        get().updateDisplayMessages();
      },

      setModelConfig: (config) => set({ modelConfig: config }),
      setToolsConfig: (config) => set({ toolsConfig: config }),
      setAvailableTools: (tools) => set({ availableTools: tools }),
      setServersStatus: (status) => set({ serversStatus: status }),
      setToolsIdMaps: (maps) => set({ toolsIdMaps: maps }),
      setToolsNameMaps: (maps) => set({ toolsNameMaps: maps }),
      setSelectedTools: (tools) => set({ selectedTools: tools }),
    }),
    {
      name: "tool-chatbot-store",
    }
  )
);
