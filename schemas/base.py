from typing import Dict, Optional, Any, List
from pydantic import BaseModel, Field


class BaseResponse(BaseModel):
    """Base response class with error code, data and message."""
    err_code: int = Field(default=0, description="Error code, 0 means success")
    data: Any = Field(default=None, description="Response data")
    msg: str = Field(default="success", description="Response message")