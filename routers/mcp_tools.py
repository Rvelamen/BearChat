from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from core.mcp import get_mcp_manager

router = APIRouter()

@router.get("/list-tools")
async def list_tools(mcp_manager=Depends(get_mcp_manager)):
    """Lista las herramientas disponibles"""
    tools_list = {}
    servers_status = {}
    for server_name in mcp_manager.servers_config.keys():
        server_conn = await mcp_manager.get_server(server_name)
        tools_list[server_name] = server_conn.list_tools()
        servers_status[server_name] = {
            "status": bool(server_conn.is_connected),  # Convert to bool for serialization
            "error": str(server_conn.error_info) if server_conn.error_info else None  # Convert to string or None
        }
    return {
        "tools": tools_list,
        "servers_status": servers_status
    }

@router.get("/list-servers")
async def list_mcp_servers(mcp_manager=Depends(get_mcp_manager)):
    """Lista los servidores MCP configurados"""
    return {"servers": list(mcp_manager.servers_config.keys())}

@router.get("/tools/{server_name}")
async def get_server_tools(server_name: str, mcp_manager=Depends(get_mcp_manager)):
    """Obtiene las herramientas disponibles para un servidor específico"""
    try:
        # Obtener conexión al servidor
        server_conn = await mcp_manager.get_server(server_name)
        # Devolver la lista de herramientas
        return {"tools": server_conn.list_tools()}
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Server '{server_name}' not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/call-tool/{server_name}")
async def call_tool(
    server_name: str, 
    tool_name: str, 
    params: Dict[str, Any],
    mcp_manager=Depends(get_mcp_manager)
):
    """Llama a una herramienta específica en un servidor MCP"""
    try:
        server_conn = await mcp_manager.get_server(server_name)
        result = await server_conn.call_tool(tool_name, **params)
        return {"result": result}
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Server or tool not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 