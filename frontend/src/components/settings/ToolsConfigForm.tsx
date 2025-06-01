import React from 'react';
import { Tool } from '../../types';
import AvailableToolsList from './AvailableToolsList';

interface ToolsConfigFormProps {
  localToolsConfig: {
    endpoint_url: string;
    execution_url: string;
  };
  setLocalToolsConfig: (config: { endpoint_url: string; execution_url: string }) => void;
  handleFetchTools: () => void;
  loadingTools: boolean;
  availableTools: { [serverName: string]: Tool[] };
  serversStatus: Record<string, { status: boolean; error: string | null }>;
  selectedTools: string[];
  toggleToolSelection: (toolId: string) => void;
}

const ToolsConfigForm: React.FC<ToolsConfigFormProps> = ({
  localToolsConfig,
  setLocalToolsConfig,
  handleFetchTools,
  loadingTools,
  availableTools,
  serversStatus,
  selectedTools,
  toggleToolSelection,
}) => {
  // console.log("availableTools: ", availableTools)
  return (
    <div className="space-y-4">
      {/* Tools Endpoint URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          工具查询 URL
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={localToolsConfig.endpoint_url}
          onChange={(e) => setLocalToolsConfig({
            ...localToolsConfig,
            endpoint_url: e.target.value
          })}
        />
      </div>
      
      {/* Tools Execution URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          工具执行 URL
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={localToolsConfig.execution_url}
          onChange={(e) => setLocalToolsConfig({
            ...localToolsConfig,
            execution_url: e.target.value
          })}
        />
      </div>
      
      {/* Fetch Tools Button */}
      <div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleFetchTools}
          disabled={loadingTools}
        >
          {loadingTools ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              加载中...
            </>
          ) : (
            '获取可用工具'
          )}
        </button>
      </div>
      
      {/* Available Tools */}
      {Object.keys(availableTools).length > 0 && (
        <AvailableToolsList 
          availableTools={availableTools}
          selectedTools={selectedTools}
          toggleToolSelection={toggleToolSelection}
          serversStatus={serversStatus}
        />
      )}
    </div>
  );
};

export default ToolsConfigForm; 