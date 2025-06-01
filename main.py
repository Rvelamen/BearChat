from fastapi import FastAPI, Request, Depends
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from core.lifespan import lifespan
from mcp_server import mcp_router
from models.base_model import Base
from routers import deep_open_tools, llm_models, mcp_client, mcp_tools, mcp_servers
from database import engine


# Crear la aplicación con el manejador de ciclo de vida
app = FastAPI(
    debug=True,
    title="LLM & Tools Management System",
    description="A web application for managing LLM models and tools",
    version="0.1.0",
    lifespan=lifespan,
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

# 包含路由
app.include_router(llm_models.router, prefix="/api/llm-models", tags=["LLM Models"])
app.include_router(deep_open_tools.router, prefix="/api/deep-open-tools", tags=["Deep Open Tools"])
app.include_router(mcp_tools.router, prefix="/api/mcp", tags=["MCP Tools"])
app.include_router(mcp_servers.router, prefix="/api/mcp-servers", tags=["MCP Servers"])
app.include_router(mcp_client.router, prefix="/mcp-client", tags=["MCP Client"])

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """返回主页面"""
    print("root")
    return FileResponse("frontend/dist/index.html")

# MCP 路由
app.mount("/", app=mcp_router.starlette_app)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8888, reload=True)
