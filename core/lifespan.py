# Gestor de contexto para el ciclo de vida de la aplicación
from contextlib import asynccontextmanager
from fastapi import FastAPI

from mcp_client.client import MCPConnectionManager

# Ruta al archivo de configuración MCP
MCP_CONFIG_PATH = "./mcp.json"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar MCPConnectionManager durante el inicio
    app.state.mcp_manager = MCPConnectionManager(config_path=MCP_CONFIG_PATH)
    # Ingresar al contexto asíncrono del gestor
    async with app.state.mcp_manager as manager:
        yield
    # El contexto se cierra automáticamente al salir
