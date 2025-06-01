async def get_mcp_manager():
    from main import app
    return app.state.mcp_manager
