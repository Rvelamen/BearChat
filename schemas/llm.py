# Pydantic模型用于数据验证
from typing import Any, Dict, Optional
from pydantic import BaseModel


class LLMModelBase(BaseModel):
    name: str
    description: Optional[str] = None
    model_type: str
    api_endpoint: Optional[str] = None
    api_key: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: bool = True

class LLMModelCreate(LLMModelBase):
    pass

class LLMModelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    model_type: Optional[str] = None
    api_endpoint: Optional[str] = None
    api_key: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class LLMModelResponse(LLMModelBase):
    id: str
    avg_response_time: Optional[float] = None
    avg_token_usage: Optional[int] = None
    
    class Config:
        from_attributes = True