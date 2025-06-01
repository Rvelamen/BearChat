# Pydantic模型用于数据验证
from typing import Any, Dict, Optional
from pydantic import BaseModel


class SystemInfo(BaseModel):
    platform: str
    system_api_key: str
    parameters: Dict[str, Any]
    method: str = "POST"
    timeout: float = 120.0


class DeepOpenToolBase(BaseModel):
    name: str
    type: str
    description: str
    input_schema: Dict[str, Any]


class DeepOpenToolCreate(DeepOpenToolBase):
    system_info: SystemInfo


class DeepOpenToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tool_type: Optional[str] = None
    input_schema: Optional[Dict[str, Any]] = None
    system_info: SystemInfo


class DeepOpenToolResponse(DeepOpenToolBase):
    id: str
    system_info: SystemInfo

    class Config:
        from_attributes = True
