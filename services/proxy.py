import json
import httpx
import asyncio
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from sse_starlette.sse import EventSourceResponse

from schemas.proxy_response import ProxyResponse
from services.tools.base import get_payload_data
from models.deep_open_tool import DeepOpenTool


async def proxy_request(
    db: Session,
    tool_name: str,
    request_data: Dict[str, Any]
):
    # 获取工具信息
    tool = db.query(DeepOpenTool).filter(DeepOpenTool.name == tool_name).first()
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filter name"
        )
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found"
        )

    try:
        if tool.system_info["parameters"].get("method") == "POST":
            print("request_data:", request_data)
            response_data = await proxy_tool_post_request(
                db, tool, request_data
            )
            if response_data["code"] != 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=response_data["msg"],
                )
            return ProxyResponse(
                data=json.loads(response_data["data"]), err_code=0, msg="success"
            )
        elif tool.system_info["parameters"].get("method") == "SSE":
            raise HTTPException(
                status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
                detail="SSE not allowed",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
                detail="Method not allowed",
            )

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error proxying request: {str(e)}",
        )


async def proxy_sse_request(
    db: Session, tool: DeepOpenTool, request_data: Dict[str, Any]
):
    if tool.system_info["method"] == "POST":
        post_response = await proxy_tool_post_request(db, tool, request_data)
        data = {"event": "tool_call_result", "data": post_response["data"]}
        print("proxy_sse_request:", data)
        yield data
        # 阻塞等前端处理
        await asyncio.sleep(0.5)
    else:
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail="Method not allowed"
        )


async def proxy_tool_post_request(
    db: Session,
    tool: DeepOpenTool,
    request_data: Dict[str, Any],
):
    payload = get_payload_data(tool, request_data)
    # 发送POST请求
    async with httpx.AsyncClient() as client:
        response = await client.post(**payload)

        # 处理响应
        response_data = response.json()

        return response_data
