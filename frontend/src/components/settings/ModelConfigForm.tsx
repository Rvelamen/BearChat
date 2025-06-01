import React, { useState } from 'react';
import { ModelOption } from '../../types';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ModelConfigFormProps {
  availableModels: ModelOption[];
  selectedModel: ModelOption;
  setSelectedModel: (model: ModelOption) => void;
  localModelConfig: {
    base_url: string;
    api_key: string;
    temperature: number;
  };
  setLocalModelConfig: (config: {
    base_url: string;
    api_key: string;
    temperature: number;
  }) => void;
  setAvailableModels: (models: ModelOption[]) => void;
}

const ModelConfigForm: React.FC<ModelConfigFormProps> = ({
  availableModels,
  selectedModel,
  setSelectedModel,
  localModelConfig,
  setLocalModelConfig,
  setAvailableModels,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const handleTestConnection = async () => {
    if (!localModelConfig.base_url || !localModelConfig.api_key) {
      toast.error('请填写 API 基础 URL 和 API Key');
      return;
    }

    setLoadingModels(true);
    try {
      const response = await fetch(`${localModelConfig.base_url}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localModelConfig.api_key}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const models = data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
      }));

      setAvailableModels(models);
      setSelectedModel(models[0]);
      toast.success('模型列表获取成功');
    } catch (error) {
      console.error('Failed to fetch models:', error);
      toast.error('获取模型列表失败，请检查 API 基础 URL 和 API Key');
    } finally {
      setLoadingModels(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          选择模型
        </label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={selectedModel.id}
          onChange={(e) => {
            const model = availableModels.find(m => m.id === e.target.value);
            if (model) setSelectedModel(model);
          }}
        >
          {availableModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* API Base URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API 基础 URL
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={localModelConfig.base_url}
          onChange={(e) => setLocalModelConfig({
            ...localModelConfig,
            base_url: e.target.value
          })}
        />
      </div>
      
      {/* API Key */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
            value={localModelConfig.api_key}
            onChange={(e) => setLocalModelConfig({
              ...localModelConfig,
              api_key: e.target.value
            })}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? (
              <EyeIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <EyeSlashIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>
      
      {/* Test Connection Button */}
      <div>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          onClick={handleTestConnection}
          disabled={loadingModels}
        >
          {loadingModels ? '加载中...' : '测试连接'}
        </button>
      </div>
      
      {/* Temperature */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Temperature: {localModelConfig.temperature}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          className="w-full"
          value={localModelConfig.temperature}
          onChange={(e) => setLocalModelConfig({
            ...localModelConfig,
            temperature: parseFloat(e.target.value)
          })}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>1</span>
          <span>2</span>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ModelConfigForm;
