from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.deep_open_tool import DeepOpenTool
from schemas.deep_open_tool import DeepOpenToolCreate, DeepOpenToolResponse, DeepOpenToolUpdate

router = APIRouter()


# API端点
@router.post("/", response_model=DeepOpenToolResponse, status_code=status.HTTP_201_CREATED)
def create_tool(tool: DeepOpenToolCreate, db: Session = Depends(get_db)):
    """创建新的工具"""
    db_tool = db.query(DeepOpenTool).filter(DeepOpenTool.name == tool.name).first()
    if db_tool:
        raise HTTPException(status_code=400, detail="Tool name already exists")

    # Convert to dict and extract system_info for separate handling if needed
    tool_data = tool.model_dump() if hasattr(tool, "model_dump") else tool.dict()
    
    # Create the tool with proper fields
    new_tool = DeepOpenTool(**tool_data)
    db.add(new_tool)
    db.commit()
    db.refresh(new_tool)
    return new_tool


@router.get("", response_model=List[DeepOpenToolResponse])
def read_tools(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取所有工具"""
    tools = db.query(DeepOpenTool).offset(skip).limit(limit).all()
    print([item.to_dict() for item in tools])
    return tools


@router.get("/{tool_id}", response_model=DeepOpenToolResponse)
def read_tool(tool_id: str, db: Session = Depends(get_db)):
    """根据ID获取特定工具"""
    tool = db.query(DeepOpenTool).filter(DeepOpenTool.id == tool_id).first()
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


@router.put("/{tool_id}", response_model=DeepOpenToolResponse)
def update_tool(tool_id: str, tool_update: DeepOpenToolUpdate, db: Session = Depends(get_db)):
    """更新工具信息"""
    db_tool = db.query(DeepOpenTool).filter(DeepOpenTool.id == tool_id).first()
    if db_tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")

    update_data = tool_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tool, key, value)

    db.commit()
    db.refresh(db_tool)
    return db_tool


@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(tool_id: str, db: Session = Depends(get_db)):
    """删除工具"""
    db_tool = db.query(DeepOpenTool).filter(DeepOpenTool.id == tool_id).first()
    if db_tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")

    db.delete(db_tool)
    db.commit()
    return None
