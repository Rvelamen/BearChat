from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON

from models.base_model import Base

class LLMModel(Base):
    __tablename__ = "llm_models"

    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    model_type = Column(String)  # 例如: gpt-3.5-turbo, llama, gemini等
    api_endpoint = Column(String, nullable=True)
    api_key = Column(String, nullable=True)
    parameters = Column(JSON, nullable=True)  # 存储模型参数