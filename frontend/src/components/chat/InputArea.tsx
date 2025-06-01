import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import React, { KeyboardEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  useTools: boolean;
  onToggleTools: (value: boolean) => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  useTools,
  onToggleTools
}) => {
  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center mr-2">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={useTools}
            onChange={(e) => onToggleTools(e.target.checked)}
          />
          <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ms-2 text-sm font-medium text-gray-600">使用工具</span>
        </label>
      </div>
      
      <div className="relative flex-1 flex items-center bg-gray-100 rounded-xl">
        <TextareaAutosize
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className="w-full py-2 pl-4 pr-10 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none max-h-32 text-gray-800"
          disabled={disabled}
          minRows={1}
          maxRows={5}
        />
        <button
          className="absolute right-2 p-1 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed send-button"
          onClick={onSubmit}
          disabled={!value.trim() || disabled}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default InputArea; 