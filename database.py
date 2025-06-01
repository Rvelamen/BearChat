from contextlib import asynccontextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# SQLite数据库URL（也可以替换为其他数据库）
SQLALCHEMY_DATABASE_URL = "sqlite:///./deepopentool.db"

# 创建engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 创建SessionLocal类
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 依赖项
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 
        
@asynccontextmanager
async def get_db_async():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()