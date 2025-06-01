from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from typing import Dict, Any

from models.base_model import Base

class DeepOpenTool(Base):
    __tablename__ = "deep_open_tools"
    
    name = Column(String, unique=True, index=True)
    type = Column(String)  # Renamed from tool_type
    description = Column(String)
    input_schema = Column(JSON, default={})  # Store tool input_schema
    system_info = Column(JSON, default={})
