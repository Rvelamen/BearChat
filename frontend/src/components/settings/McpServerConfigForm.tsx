import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, Select, message, Popconfirm } from "antd";
import { formatJson, parseJson } from "../../utils/helpers";

interface MCPServer {
  id: string;
  name: string;
  description?: string;
  transport: string;
  command: string;
  status: string;
  url?: string;
  args?: string;
  env?: string;
  config?: string;
  // additional fields if needed
}

const McpServerConfigForm: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
  const transportValue = Form.useWatch("transport", form);
  const [isJsonModalVisible, setIsJsonModalVisible] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  const fetchServers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8888/api/mcp-servers");
      const data = await res.json();
      setServers(data);
    } catch (err: any) {
      setError(err.message || "错误");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleFormFinish = async (values: any) => {
    const payload = {
      name: values.name || "",
      description: values.description || "",
      transport: values.transport || "",
      command: values.command || "",
      status: values.status || "",
      url: values.url || "",
      args: values.args || [],
      env: values.env || {},
      config: values.config || {}
    };

    try {
      if (editingServer) {
        await fetch(`http://localhost:8888/api/mcp-servers/${editingServer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        setEditingServer(null);
      } else {
        await fetch("http://localhost:8888/api/mcp-servers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      form.resetFields();
      setIsModalVisible(false);
      fetchServers();
    } catch (error) {
      message.error("保存失败");
    }
  };

  const handleDeleteServer = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8888/api/mcp-servers/${id}`, {
        method: "DELETE",
      });
      fetchServers();
    } catch (error) {
      message.error(error);
    }
  };

  const handleEditServer = (server: MCPServer) => {
    form.setFieldsValue(server);
    setEditingServer(server);
    setIsModalVisible(true);
  };

  const handleJsonFinish = async (values: any) => {
    try {
      const payload = JSON.parse(values.jsonData);
      await fetch("http://localhost:8888/api/mcp-servers/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      message.success("服务器添加成功");
      setIsJsonModalVisible(false);
      setJsonInput("");
      fetchServers();
    } catch (error) {
      console.error(error);
      message.error("JSON格式错误或添加失败");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">MCP 服务器列表</h3>
        <div className="flex space-x-2">
          <Button
            type="primary"
            onClick={() => {
              setEditingServer(null);
              setIsModalVisible(true);
              form.resetFields();
              form.setFieldsValue({ transport: "sse", status: "online" });
            }}
          >
            添加服务器
          </Button>
          <Button onClick={() => setIsJsonModalVisible(true)}>
            通过 JSON 添加
          </Button>
        </div>
      </div>
      {loading ? (
        <p>正在加载...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul>
          {servers.map((server) => (
            <li
              key={server.id}
              onClick={() => handleEditServer(server)}
              className="border p-2 mb-2 rounded flex justify-between items-center cursor-pointer"
            >
              <div className="cursor-pointer">
                <p className="font-medium">{server.name}</p>
                <p className="text-sm text-gray-600">{server.description}</p>
                <p className="text-sm">Transport: {server.transport}</p>
                <p className="text-sm">Command: {server.command}</p>
              </div>
              <div className="mr-2">
                <Popconfirm
                  title="确定要删除此服务器吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDeleteServer(server.id);
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
        title={editingServer ? "编辑服务器" : "创建新服务器"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingServer(null);
        }}
        footer={null}
        getContainer={false}
        bodyStyle={{ height: "60vh", overflowY: "auto" }}
      >
        <Form form={form} layout="vertical" onFinish={handleFormFinish}>
          <Form.Item
            label="服务器名称"
            name="name"
            rules={[{ required: true, message: "请输入服务器名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="传输方式"
            name="transport"
            rules={[{ required: true, message: "请选择传输方式" }]}
          >
            <Select>
              <Select.Option value="sse">SSE</Select.Option>
              <Select.Option value="stdio">STDIO</Select.Option>
              <Select.Option value="http">HTTP</Select.Option>
            </Select>
          </Form.Item>
          {transportValue !== "sse" && (
            <>
              <Form.Item
                label="命令"
                name="command"
                rules={[{ required: true, message: "请输入命令" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="参数 (JSON 数组)"
                name="args"
                normalize={(value) => formatJson(value || [])}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </>
          )}
          <Form.Item
            label="环境变量 (JSON 对象)"
            name="env"
            normalize={(value) => {
              try {
                return parseJson(value);
              } catch (error) {
                return value;
              }
            }}
            getValueProps={(value) => ({
              value:
                typeof value === "string" ? value : formatJson(value || {}),
            })}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          {transportValue !== "stdio" && (
            <Form.Item label="URL" name="url">
              <Input />
            </Form.Item>
          )}
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select>
              <Select.Option value="online">在线</Select.Option>
              <Select.Option value="offline">离线</Select.Option>
              <Select.Option value="maintenance">维护中</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="配置 (JSON 对象)"
            name="config"
            normalize={(value) => {
              try {
                return parseJson(value);
              } catch (error) {
                return value;
              }
            }}
            getValueProps={(value) => ({
              value:
                typeof value === "string" ? value : formatJson(value || {}),
            })}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingServer ? "保存更改" : "创建服务器"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="通过 JSON 添加服务器"
        open={isJsonModalVisible}
        onCancel={() => {
          setIsJsonModalVisible(false);
          setJsonInput("");
        }}
        footer={null}
        getContainer={false}
      >
        <Form onFinish={handleJsonFinish}>
          <Form.Item
            label=""
            name="jsonData"
            rules={[{ required: true, message: "请输入服务器配置" }]}
          >
            <Input.TextArea
              rows={10}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              添加服务器
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default McpServerConfigForm;
