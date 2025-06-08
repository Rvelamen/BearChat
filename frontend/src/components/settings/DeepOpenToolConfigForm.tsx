import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, message, Popconfirm, Select } from "antd";
import { formatJson, parseJson } from "../../utils/helpers";

interface DeepOpenTool {
  id: string;
  name: string;
  type: string;
  description: string;
  input_schema: object;
  system_info: {
    platform: string;
    system_api_key: string;
    parameters: object;
    method: string;
    timeout: number;
  };
}

const DeepOpenToolConfigForm: React.FC = () => {
  const [tools, setTools] = useState<DeepOpenTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTool, setEditingTool] = useState<DeepOpenTool | null>(null);

  const fetchTools = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/deep-open-tools");
      if (!res.ok) throw new Error("Failed to fetch tools");
      const data = await res.json();
      setTools(data);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleFormFinish = async (values: any) => {
    const payload = {
      name: values.name || "",
      type: values.type || "",
      description: values.description || "",
      input_schema: values.input_schema ? parseJson(values.input_schema) : {},
      system_info: {
        platform: values.system_info.platform || "",
        system_api_key: values.system_info.system_api_key || "",
        parameters: values.system_info.parameters
          ? parseJson(values.system_info.parameters)
          : {},
        method: values.system_info.method || "",
        timeout: Number(values.system_info.timeout) || 0,
      },
    };

    try {
      if (editingTool) {
        const res = await fetch(
          `/api/deep-open-tools/${editingTool.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("Failed to update tool");
        message.success("更新成功");
        setEditingTool(null);
      } else {
        const res = await fetch("/api/deep-open-tools", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create tool");
        message.success("添加成功");
      }
      form.resetFields();
      setIsModalVisible(false);
      fetchTools();
    } catch (error) {
      console.error(error);
      message.error("操作失败");
    }
  };

  const handleDeleteTool = async (id: string) => {
    try {
      const res = await fetch(
        `/api/deep-open-tools/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete tool");
      message.success("删除成功");
      fetchTools();
    } catch (error) {
      console.error(error);
      message.error("删除失败");
    }
  };

  const handleEditTool = (tool: DeepOpenTool) => {
    setEditingTool(tool);
    form.setFieldsValue({
      name: tool.name,
      type: tool.type,
      description: tool.description,
      input_schema: formatJson(tool.input_schema),
      system_info: {
        platform: tool.system_info.platform,
        system_api_key: tool.system_info.system_api_key,
        parameters: formatJson(tool.system_info.parameters),
        method: tool.system_info.method,
        timeout: tool.system_info.timeout,
      },
    });
    setIsModalVisible(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">DeepOpenTool 列表</h3>
        <Button
          type="primary"
          onClick={() => {
            setEditingTool(null);
            setIsModalVisible(true);
            form.resetFields();
          }}
        >
          添加工具
        </Button>
      </div>
      {loading ? (
        <p>正在加载...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul>
          {tools.map((tool) => (
            <li
              onClick={() => handleEditTool(tool)}
              key={tool.id}
              className="border p-2 mb-2 rounded flex justify-between items-center cursor-pointer"
            >
              <div className="cursor-pointer">
                <p className="font-medium">{tool.name}</p>
                <p className="text-sm text-gray-600">{tool.description}</p>
                <p className="text-sm">类型: {tool.type}</p>
              </div>
              <div className="mr-2">
                <Popconfirm
                  title="确定要删除此工具吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDeleteTool(tool.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="primary"
                    danger
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                  >
                    删除
                  </Button>
                </Popconfirm>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        title={editingTool ? "编辑工具" : "添加工具"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingTool(null);
        }}
        footer={null}
        getContainer={false}
        bodyStyle={{
          height: "60vh",
          overflowY: "scroll",
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleFormFinish}>
          <Form.Item
            label="工具名称"
            name="name"
            rules={[{ required: true, message: "请输入工具名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="类型"
            name="type"
            rules={[{ required: true, message: "请输入工具类型" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: "请输入描述" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="输入模式 (JSON)"
            name="input_schema"
            rules={[{ required: true, message: "请输入输入模式" }]}
          >
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item
            label="平台"
            name={["system_info", "platform"]}
            rules={[{ required: true, message: "请选择平台" }]}
          >
            <Select>
              <Select.Option value="coze">Coze</Select.Option>
              {/* <Select.Option value="dify">Dify</Select.Option> */}
            </Select>
          </Form.Item>
          <Form.Item
            label="系统 API Key"
            name={["system_info", "system_api_key"]}
            rules={[{ required: true, message: "请输入系统 API Key" }]}
          >
            <Input.Password visibilityToggle={true} />
          </Form.Item>
          <Form.Item
            label="参数 (JSON)"
            name={["system_info", "parameters"]}
            rules={[{ required: true, message: "请输入参数" }]}
          >
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item
            label="方法"
            name={["system_info", "method"]}
            initialValue="POST"
            rules={[{ required: true, message: "请输入方法" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="超时时间 (秒)"
            name={["system_info", "timeout"]}
            initialValue={120.0}
            rules={[{ required: true, message: "请输入超时时间" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingTool ? "保存更改" : "添加工具"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeepOpenToolConfigForm;
