import React, { useState, useEffect } from "react";
import { Message, ToolCall } from "../../types";
import { formatMessage, safeJsonParse } from "../../utils/helpers";


interface MessageBubbleProps {
  messages: Message[];
  isLoading: boolean;
  toolsIdMaps: Record<string, any>;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  messages,
  isLoading,
  toolsIdMaps,
}) => {
  // Track which tool call panels are open
  const [openPanels, setOpenPanels] = useState<number[]>([]);

  // Toggle a panel's open/closed state
  const togglePanel = (panelIndex: number) => {
    if (openPanels.includes(panelIndex)) {
      setOpenPanels(openPanels.filter((i) => i !== panelIndex));
    } else {
      setOpenPanels([...openPanels, panelIndex]);
    }
  };

  // Render content with HTML from marked (dangerouslySetInnerHTML)
  const renderContent = (content: string) => {
    if (!content) return null;
    return <div className="markdown-body" style={{ backgroundColor: 'inherit' }} dangerouslySetInnerHTML={{ __html: formatMessage(content) }} />;
  };

  if (messages[0].role === "user") {
    return (
      <div className="flex flex-row-reverse">
        <div className="w-full flex items-start flex-row-reverse">
          <div className="bg-blue-400 h-8 w-8 rounded-full flex items-center justify-center text-white ml-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div className="message-bubble user-message text-white p-3 rounded-lg max-w-[80%]">
            {renderContent(messages[0].content)}
          </div>
        </div>
      </div>
    );
  } else if (messages[0].role == "assistant") {
    return (
      <div className="flex">
        <div className="w-full flex items-start">
          <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center text-white mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"
              />
            </svg>
          </div>
          {messages.map((message, index) => {
            return (
              <div className="message-bubble assistant-message p-3" key={index}>
                {/* Display Loading State */}
                {isLoading &&
                !message.content &&
                !message.tool_call &&
                !message.tool_response ? (
                  <div className="flex items-center mt-4 items-baseline">
                    <div className="mr-2">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                    </div>
                    <div className="mr-2">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                    </div>
                    <div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-500">
                      思考中...
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Message Content */}
                    {renderContent(message.content)}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  } else if (messages[0].role === "tool") {
    return (
      <div className="flex">
        <div className="w-full flex items-start">
          <div className="h-8 w-8 rounded-full bg-purple-400 flex items-center justify-center text-white mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 10.21a6 6 0 118.484 8.486M6.404 8.697l5.484 5.485"
              />
            </svg>
          </div>
          <div className="message-bubble assistant-message p-3">
            {messages.map((message, index) => {
              return (
                <div key={index}>
                  {/* Display Loading State */}
                  {isLoading &&
                  !message.content &&
                  !message.tool_call &&
                  !message.tool_response ? (
                    <div className="flex items-center items-baseline">
                      <div className="mr-2">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                      </div>
                      <div className="mr-2">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                      </div>
                      <div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                      <span className="mt-2 ml-3 text-sm text-gray-500">
                        思考中...
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Tool Calls Section */}
                      {message.tool_call && (
                        <div className="mt-2 space-y-2">
                          <div
                            key={`${message.tool_call.id}-${index}`}
                            className="border rounded-lg overflow-hidden bg-gray-50"
                          >
                            <div
                              className="flex items-center justify-between p-2 bg-gray-100 cursor-pointer items-baseline"
                              onClick={() => togglePanel(index)}
                            >
                              <div className="flex items-center mr-7">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-5 h-5 mr-2 text-blue-600"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                                  />
                                </svg>
                                <span className="font-medium">
                                  调用工具:{" "}
                                  {toolsIdMaps[message.tool_call.function.name]
                                    ?.name || message.tool_call.function.name}
                                </span>
                              </div>

                              <div className="flex items-center">
                                {!message.tool_response &&
                                  message.isProcessingTools && (
                                    <div className="mt-2 animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                                  )}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className={`w-5 h-5 transition-transform ${
                                    openPanels.includes(index)
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                  />
                                </svg>
                              </div>
                            </div>

                            {openPanels.includes(index) && (
                              <div className="p-3 border-t border-gray-200">
                                <div className="mb-2">
                                  <div className="text-sm font-medium mb-1">
                                    输入参数:
                                  </div>
                                  <div className="bg-gray-100 p-2 rounded-md overflow-x-auto">
                                    <pre className="text-xs">
                                      <code>
                                        {JSON.stringify(
                                          safeJsonParse(
                                            message.tool_call.function.arguments
                                          ) || {},
                                          null,
                                          2
                                        )}
                                      </code>
                                    </pre>
                                  </div>
                                </div>

                                {message.tool_response && (
                                  <div>
                                    <div className="text-sm font-medium mb-1">
                                      输出结果:
                                    </div>
                                    <div className="bg-gray-100 p-2 rounded-md overflow-x-auto">
                                      <pre className="text-xs">
                                        <code>
                                          {JSON.stringify(
                                            safeJsonParse(
                                              message.tool_response.content
                                            ),
                                            null,
                                            2
                                          )}
                                        </code>
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tool Results */}
                      {message.content && (
                        <div className="tool-results">
                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="tool-results-card p-3 rounded-lg">
                            <div className="font-medium flex items-center mb-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5 mr-1 text-green-600"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                                />
                              </svg>
                              工具结果分析
                            </div>
                            {renderContent(message.content)}
                          </div>
                        </div>
                      )}

                      {/* Processing indicator for tools or chat */}
                      {message.isProcessingTools && (
                        <div className="mt-3">
                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="flex items-center">
                            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 animate-pulse"></div>
                            </div>
                            <span className="ml-2 text-xs text-gray-500">
                              {message.processingChatResponse
                                ? "分析工具结果中..."
                                : "处理工具调用中..."}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
};

export default MessageBubble;
