import uuid

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base


_Base = declarative_base()


class Base(_Base):
    __abstract__ = True  # 抽象基类，不会创建表

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
