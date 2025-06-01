import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { fetchTools } from '../../utils/api';
import { ModelOption, Tool } from '../../types';
import { simpleUUID } from '../../utils/helpers';
import ModelConfigForm from './ModelConfigForm';
import ToolsConfigForm from './ToolsConfigForm';
import McpServerConfigForm from './McpServerConfigForm';
import DeepOpenToolConfigForm from './DeepOpenToolConfigForm';
import { Modal, Button, Tabs, message, notification } from 'antd';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const [loadingTools, setLoadingTools] = useState(false);
  
  // Define available models
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([
    { id: "deepseek-chat", name: "deepseek-chat" }
  ]);
  
  // Local state for settings
  const [selectedModel, setSelectedModel] = useState<ModelOption>(availableModels[0]);
  const [localModelConfig, setLocalModelConfig] = useState({
    base_url: '',
    api_key: '',
    temperature: 0.7
  });
  const [localToolsConfig, setLocalToolsConfig] = useState({
    endpoint_url: '',
    execution_url: ''
  });
  
  // Get state from store
  const { 
    modelConfig, 
    toolsConfig, 
    availableTools, 
    serversStatus,
    selectedTools,
    setModelConfig,
    setToolsConfig,
    setSelectedTools,
    setAvailableTools,
    setServersStatus,
    setToolsIdMaps,
    setToolsNameMaps
  } = useChatStore();
  
  // Initialize local state from store
  useEffect(() => {
    // Find the selected model from available models
    const currentModel = availableModels.find(model => model.id === modelConfig.model) || availableModels[0];
    setSelectedModel(currentModel);
    
    setLocalModelConfig({
      base_url: modelConfig.base_url,
      api_key: modelConfig.api_key,
      temperature: modelConfig.temperature
    });
    
    setLocalToolsConfig({
      endpoint_url: toolsConfig.endpoint_url,
      execution_url: toolsConfig.execution_url
    });
  }, [open, modelConfig, toolsConfig]);
  
  // Fetch available tools
  const handleFetchTools = async () => {
    setLoadingTools(true);
    try {
      const toolsData = await fetchTools(localToolsConfig.endpoint_url);
      setAvailableTools(toolsData['tools']);
      setServersStatus(toolsData['servers_status']);
      
      const toolsIdMaps = {};
      const toolsNameMaps = {};
      
      // Process tools data
      for (const serverName in toolsData['tools']) {
        for (const tool of toolsData['tools'][serverName]) {
          const toolId = simpleUUID();
          tool.id = toolId;
          tool.server_name = serverName;
          toolsIdMaps[toolId] = tool;
          toolsNameMaps[`${serverName}/${tool.name}`] = toolId;
        }
      }
      
      setToolsIdMaps(toolsIdMaps);
      setToolsNameMaps(toolsNameMaps);
      
      // Filter out tools that no longer exist
      const filteredSelectedTools = selectedTools.filter(tool => {
        const [serverName, toolName] = tool.split('/');
        return toolsData[serverName] && toolsData[serverName].some(t => t.name === toolName);
      });
      
      setSelectedTools(filteredSelectedTools);
    } catch (error) {
      setAvailableTools({})
      setServersStatus({})
      console.error('Failed to fetch tools:', error);
      notification.error({message: "错误", description: "Fetch Tools Failed"})
    } finally {
      setLoadingTools(false);
    }
  };
  
  // Save settings
  const handleSaveSettings = () => {
    setModelConfig({
      ...modelConfig,
      base_url: localModelConfig.base_url,
      api_key: localModelConfig.api_key,
      temperature: localModelConfig.temperature,
      model: selectedModel.id
    });
    
    setToolsConfig({
      ...toolsConfig,
      endpoint_url: localToolsConfig.endpoint_url,
      execution_url: localToolsConfig.execution_url
    });
    
    onClose();
  };
  
  // Toggle tool selection
  const toggleToolSelection = (toolId: string) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(selectedTools.filter(id => id !== toolId));
    } else {
      setSelectedTools([...selectedTools, toolId]);
    }
  };
  
  return (
    <Modal
      open={open}
      title="设置"
      width="60%"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="save" type="primary" onClick={handleSaveSettings}>保存</Button>
      ]}
      bodyStyle={{ height: '60vh', overflowY: 'auto' }}
    >
      <Tabs defaultActiveKey="1" tabBarStyle={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
        <Tabs.TabPane tab="模型配置" key="1">
          <ModelConfigForm 
            availableModels={availableModels}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            localModelConfig={localModelConfig}
            setLocalModelConfig={setLocalModelConfig}
            setAvailableModels={setAvailableModels}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="工具配置" key="2">
          <ToolsConfigForm 
            localToolsConfig={localToolsConfig}
            setLocalToolsConfig={setLocalToolsConfig}
            handleFetchTools={handleFetchTools}
            loadingTools={loadingTools}
            availableTools={availableTools}
            serversStatus={serversStatus}
            selectedTools={selectedTools}
            toggleToolSelection={toggleToolSelection}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="MCP 服务器" key="3">
          <McpServerConfigForm />
        </Tabs.TabPane>
        <Tabs.TabPane tab="DeepOpenTool" key="4">
          <DeepOpenToolConfigForm />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default SettingsDialog; 