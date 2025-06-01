from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from database import get_db
from models.llm_model import LLMModel
from schemas.llm import LLMModelCreate, LLMModelResponse, LLMModelUpdate

router = APIRouter()


# API端点
@router.post("/", response_model=LLMModelResponse, status_code=status.HTTP_201_CREATED)
def create_llm_model(model: LLMModelCreate, db: Session = Depends(get_db)):
    """创建新的LLM模型"""
    db_model = db.query(LLMModel).filter(LLMModel.name == model.name).first()
    if db_model:
        raise HTTPException(status_code=400, detail="Model name already exists")

    new_model = LLMModel(**model.dict())
    db.add(new_model)
    db.commit()
    db.refresh(new_model)
    return new_model


@router.get("/", response_model=List[LLMModelResponse])
def read_llm_models(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取所有LLM模型"""
    models = db.query(LLMModel).offset(skip).limit(limit).all()
    return models


@router.get("/{model_id}", response_model=LLMModelResponse)
def read_llm_model(model_id: int, db: Session = Depends(get_db)):
    """根据ID获取特定LLM模型"""
    model = db.query(LLMModel).filter(LLMModel.id == model_id).first()
    if model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


@router.put("/{model_id}", response_model=LLMModelResponse)
def update_llm_model(
    model_id: int, model_update: LLMModelUpdate, db: Session = Depends(get_db)
):
    """更新LLM模型信息"""
    db_model = db.query(LLMModel).filter(LLMModel.id == model_id).first()
    if db_model is None:
        raise HTTPException(status_code=404, detail="Model not found")

    update_data = model_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_model, key, value)

    db.commit()
    db.refresh(db_model)
    return db_model


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_llm_model(model_id: int, db: Session = Depends(get_db)):
    """删除LLM模型"""
    db_model = db.query(LLMModel).filter(LLMModel.id == model_id).first()
    if db_model is None:
        raise HTTPException(status_code=404, detail="Model not found")

    db.delete(db_model)
    db.commit()
    return None
