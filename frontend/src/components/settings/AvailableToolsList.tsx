import React, { useState } from 'react';
import { Tool } from '../../types';

interface AvailableToolsListProps {
  availableTools: Record<string, Tool[]>;
  selectedTools: string[];
  serversStatus: Record<string, { status: boolean; error: string | null }>;
  toggleToolSelection: (toolId: string) => void;
}

const AvailableToolsList: React.FC<AvailableToolsListProps> = ({
  availableTools,
  selectedTools,
  toggleToolSelection,
  serversStatus
}) => {
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());

  const toggleServer = (serverName: string) => {
    setExpandedServers(prev => {
      const next = new Set(prev);
      next.has(serverName) ? next.delete(serverName) : next.add(serverName);
      return next;
    });
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">可用工具</h3>
      <div className="border rounded-lg overflow-hidden">
        {Object.entries(availableTools).map(([serverName, tools]) => (
          <div key={serverName} className="border-b last:border-b-0">
            <button
              className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 font-medium text-gray-700 cursor-pointer"
              onClick={() => toggleServer(serverName)}
            >
              <span>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${serversStatus[serverName] && serversStatus[serverName].status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {serverName}
              </span>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  expandedServers.has(serverName) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedServers.has(serverName) && (
              <>
                {serversStatus[serverName] && !serversStatus[serverName].status ? (
                  <div className="p-3 text-red-500">{serversStatus[serverName].error}</div>
                ) : (
                  <ul className="divide-y">
                    {tools.map((tool: Tool) => (
                      <li key={`${serverName}-${tool.name}`} className="p-3">
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            id={`${serverName}-${tool.name}`}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedTools.includes(`${serverName}/${tool.name}`)}
                            onChange={() => toggleToolSelection(`${serverName}/${tool.name}`)}
                          />
                          <label htmlFor={`${serverName}-${tool.name}`} className="ml-3 block">
                            <span className="font-medium text-gray-700">{tool.name}</span>
                            <p className="text-sm text-gray-500">{tool.description}</p>
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableToolsList; 