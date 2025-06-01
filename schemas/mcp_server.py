# Pydantic 模型用于请求和响应
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class MCPServerCreate(BaseModel):
    name: str
    description: Optional[str] = None
    transport: str
    command: str
    args: Optional[List[str]] = None
    env: Optional[Dict[str, Any]] = None
    url: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class MCPServerResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    transport: str
    command: str
    args: Optional[List[str]] = None
    env: Optional[Dict[str, Any]] = None
    url: Optional[str] = None
    status: str
    config: Optional[Dict[str, Any]] = None
    is_active: bool

    class Config:
        from_attributes = True

class MCPServerUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    transport: Optional[str] = None
    command: Optional[str] = None
    args: Optional[List[str]] = None
    env: Optional[Dict[str, Any]] = None
    url: Optional[str] = None
    status: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None