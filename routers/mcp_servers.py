from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from core.mcp import get_mcp_manager
from database import get_db
from models.mcp_server import MCPServer
from schemas.mcp_server import MCPServerCreate, MCPServerResponse, MCPServerUpdate

router = APIRouter()


@router.get("", response_model=List[MCPServerResponse])
def get_all_mcp_servers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(MCPServer).offset(skip).limit(limit).all()


@router.get("/{server_id}", response_model=MCPServerResponse)
def get_mcp_server(server_id: str, db: Session = Depends(get_db)):
    server = db.query(MCPServer).filter(MCPServer.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="MCP服务器不存在")
    return server


@router.post("", response_model=MCPServerResponse, status_code=status.HTTP_201_CREATED)
async def create_mcp_server(
    server_data: MCPServerCreate,
    db: Session = Depends(get_db),
    mcp_manager=Depends(get_mcp_manager),
):
    if not server_data.name:
        raise HTTPException(status_code=400, detail="服务器名称不能为空")
    # 检查服务器名称是否已存在
    existing_server = (
        db.query(MCPServer).filter(MCPServer.name == server_data.name).first()
    )
    if existing_server:
        raise HTTPException(status_code=400, detail="该名称的MCP服务器已存在")

    # 创建新服务器
    new_server = MCPServer(**server_data.dict())
    db.add(new_server)
    db.commit()
    db.refresh(new_server)

    await mcp_manager.load_config()
    return new_server


@router.post("/json", response_model=MCPServerResponse)
async def create_mcp_server_json(
    server_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    mcp_manager=Depends(get_mcp_manager),
):
    # 只添加一个服务器
    for k, v in server_data.items():
        server_info = {
            "name": k,
            "description": v.get('description'),
            "transport": v.get(
                "transport", "sse" if "url" in v else "stdio"
            ),
            "env": v.get("env", {}),
            "args": v.get("args", []),
            "command": v.get('command', ''),
            "status": "online",
            "url": v.get('url', ""),
            "config": v.get("config", {})
        }
        return await create_mcp_server(MCPServerCreate(**server_info), db, mcp_manager)


@router.put("/{server_id}", response_model=MCPServerResponse)
async def update_mcp_server(
    server_id: str,
    server_data: MCPServerUpdate,
    db: Session = Depends(get_db),
    mcp_manager=Depends(get_mcp_manager),
):
    # 获取要更新的服务器
    server = db.query(MCPServer).filter(MCPServer.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="MCP服务器不存在")

    # 更新服务器字段
    update_data = server_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(server, key, value)

    db.commit()
    db.refresh(server)
    await mcp_manager.load_config()
    return server


@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mcp_server(
    server_id: str, db: Session = Depends(get_db), mcp_manager=Depends(get_mcp_manager)
):
    server = db.query(MCPServer).filter(MCPServer.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="MCP服务器不存在")

    db.delete(server)
    db.commit()
    await mcp_manager.load_config()
    return None
