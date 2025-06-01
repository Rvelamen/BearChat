import React from 'react';
import { useChatStore } from '../../store/chatStore';
import { PlusIcon, ChatBubbleBottomCenterTextIcon, TrashIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick }) => {
  const { 
    chatHistory, 
    currentChatIndex, 
    setCurrentChatIndex, 
    deleteChat, 
    addChat 
  } = useChatStore();

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          onClick={addChat}
        >
          <PlusIcon className="w-5 h-5" />
          新建对话
        </button>
      </div>

      <div className="border-t border-gray-200 my-1"></div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-medium text-gray-500">历史对话</div>
        <ul className="space-y-1 px-2">
          {chatHistory.map((chat, index) => (
            <li key={index} className="relative">
              <button
                className={`w-full flex items-center justify-between p-2 text-left rounded-lg hover:bg-gray-100 ${
                  currentChatIndex === index ? 'bg-gray-100' : ''
                }`}
                onClick={() => setCurrentChatIndex(index)}
              >
                <div className="flex items-center">
                  <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-2" />
                  <span className="truncate max-w-[160px]">
                    {chat.title || `新对话 ${index + 1}`}
                  </span>
                </div>
                <button
                  className="p-1 rounded-full hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(index);
                  }}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Settings Button */}
      <div className="border-t border-gray-200 p-4">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          onClick={onSettingsClick}
        >
          <WrenchScrewdriverIcon className="w-5 h-5" />
          设置
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 