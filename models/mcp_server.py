import uuid
from sqlalchemy import Column, Integer, String, JSON, Text, Float

from models.base_model import Base

class MCPServer(Base):
    __tablename__ = "mcp_servers"
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    transport = Column(String, nullable=False)
    command = Column(String, nullable=False)
    args = Column(JSON, nullable=True)  # 存储List[str]类型数据
    env = Column(JSON, nullable=True)
    url = Column(String, nullable=True)
    status = Column(String, default="offline")  # offline, online, maintenance
    config = Column(JSON, nullable=True)  # 服务器配置参数 