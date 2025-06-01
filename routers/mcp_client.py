from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union, Literal
import json
import asyncio
import httpx
from uuid import uuid4


router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str
    name: Optional[str] = None
    function_call: Optional[Dict[str, Any]] = None

class FunctionDefinition(BaseModel):
    name: str
    description: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000
    stream: Optional[bool] = True
    mcp_options: Optional[Dict[str, Any]] = None
    functions: Optional[List[FunctionDefinition]] = None
    function_call: Optional[Union[Literal["auto", "none"], Dict[str, str]]] = None

async def format_sse_event(data: str, event: Optional[str] = None) -> str:
    """格式化SSE事件"""
    message = f"data: {data}\n"
    if event:
        message = f"event: {event}\n{message}"
    return message + "\n"

@router.post("/chat")
async def chat_completion(request: ChatRequest):
    """
    使用SSE流式传输LLM对话响应
    """
    
    return StreamingResponse(
        stream_chat_response(request),
        media_type="text/event-stream"
    )

def insert_mcp_tool(openai_request: Dict[str, Any]):
    """插入MCP工具"""
    openai_request["tools"] = [
        {
            "type": "function",
            "function": {
                "name": "mcp_tool",
                "description": "MCP工具",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "mcp_id": {"type": "string", "description": "MCP ID"},
                        "mcp_name": {"type": "string", "description": "MCP 名称"}
                    }
                }
            }
        }
    ]
    

async def stream_chat_response(request: ChatRequest):
    """生成LLM对话的SSE事件流"""
    
    try:
        # 转发请求到OpenAI API
        async with httpx.AsyncClient(base_url="https://api.chatanywhere.tech", timeout=60.0) as client:
            headers = {
                "Authorization": f"Bearer sk-IEgM3biL9IJzTo4MEtixMNdns1iYtEg0O5ECn5H6uNREPsKi",
                "Content-Type": "application/json"
            }
            
            # 准备请求数据
            openai_request = {
                "model": request.model,
                "messages": [
                    {
                        "role": msg.role,
                        "content": msg.content,
                        **({"name": msg.name} if msg.name else {}),
                        **({"function_call": msg.function_call} if msg.function_call else {})
                    } 
                    for msg in request.messages
                ],
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
                "stream": True
            }
                        
            # 发送请求并处理流式响应
            async with client.stream("POST", "/v1/chat/completions", json=openai_request, headers=headers) as response:
                if response.status_code != 200:
                    error_data = await response.aread()
                    yield await format_sse_event(
                        json.dumps({"error": f"OpenAI API error: {error_data.decode()}", "type": "error"}),
                        "message"
                    )
                    return
                
                async for chunk in response.aiter_text():
                    if chunk.strip():
                        # 处理每个SSE事件
                        for line in chunk.strip().split("\n"):
                            if line.startswith("data: "):
                                data = line[6:]
                                if data == "[DONE]":
                                    yield await format_sse_event("[DONE]", "message")
                                else:
                                    try:
                                        # 直接转发OpenAI的响应格式
                                        yield await format_sse_event(data, "message")
                                    except json.JSONDecodeError:
                                        yield await format_sse_event(
                                            json.dumps({"error": f"Failed to parse JSON: {data}", "type": "error"}),
                                            "message"
                                        )
    
    except Exception as e:
        # 发送错误事件
        yield await format_sse_event(
            json.dumps({"error": str(e), "type": "error"}),
            "message"
        )

# 添加健康检查端点
@router.get("/health")
async def health_check():
    return {"status": "ok"}
