import json
from typing import Dict, Any


def coze_proxy_workflow_payload(tool, request_data: Dict[str, Any]):
    print("【coze_proxy_workflow_payload】")
    return {
        "url": "https://api.coze.cn/v1/workflow/run",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {tool.system_info['system_api_key']}",
        },
        "json": {
            "parameters": request_data,
            "workflow_id": tool.system_info["parameters"]["workflow_id"],
        },
        "timeout": 120.0,
    }
