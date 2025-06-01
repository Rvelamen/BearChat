import React from 'react';
import { Message } from '../../types';
import MessageBubble from './MessageBubble';
import { simpleUUID } from '../../utils/helpers';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

interface MessageListProps {
  messages: Message[][];
  isLoading: boolean;
  toolsIdMaps: Record<string, any>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, toolsIdMaps }) => {
  
  return (
    <div className="h-full">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 h-full">
          <div className="text-gray-400 mb-2">
            <ChatBubbleBottomCenterTextIcon className="w-12 h-12" />
          </div>
          <div className="text-gray-500">开始一个新的对话</div>
        </div>
      ) : (
        <div className="space-y-4 py-4">
          {messages.map((message, index) => {
            return (
              <MessageBubble
                key={index}
                messages={message}
                isLoading={isLoading && index === messages.length - 1}
                toolsIdMaps={toolsIdMaps}
              />
            );
          })}
          {isLoading && messages.length === 0 && (
            <div className="flex justify-center py-10">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageList;