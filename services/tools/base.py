

from typing import Any, Dict
from fastapi import HTTPException, status
from services.tools.coze import coze_proxy_workflow_payload


def get_payload_data(tool, request_data: Dict[str, Any]):
    print("tool.system_info", tool.system_info)
    if tool.system_info["platform"] == "coze":
        return coze_proxy_workflow_payload(tool, request_data)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid platform")
