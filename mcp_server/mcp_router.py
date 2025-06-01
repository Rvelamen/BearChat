import logging
from typing import Dict, List, Union

from fastapi import Request
import mcp.types as types
from mcp.server.lowlevel import Server
from mcp.shared._httpx_utils import create_mcp_http_client
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.responses import Response
from starlette.routing import Mount, Route

from database import get_db_async
from models.deep_open_tool import DeepOpenTool
from services.proxy import proxy_request


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(module)s:%(lineno)d - %(funcName)s - %(message)s",
)


mcp_app = Server("mcp-website-fetcher")
sse = SseServerTransport("/messages/")


async def get_base64_data_from_url(url: str) -> str:
    async with create_mcp_http_client() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.content


async def adapte_deepopen_tool(
    result: Union[Dict, List],
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    async def get_item(
        item: Dict,
    ) -> types.TextContent | types.ImageContent | types.EmbeddedResource:
        if result["type"] == "table":
            return [
                types.TextContent(type="text", text=item["content"])
                for item in result["data"]
            ]
        elif result["type"] == "markdown":
            return [types.TextContent(type="text", text=result["content"])]
        elif result["type"] == "text":
            return [types.TextContent(type="text", text=result["content"])]
        elif result["type"] == "image":
            return [
                types.ImageContent(
                    type="image", image=await get_base64_data_from_url(result["url"])
                )
            ]
        else:
            raise ValueError(f"Unknown result type: {type(result)}")

    if isinstance(result, Dict):
        return await get_item(result)
    elif isinstance(result, List):
        return [await get_item(item) for item in result]
    else:
        raise ValueError(f"Unknown result type: {type(result)}")


async def execute_api_tool(
    name: str, arguments: dict
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    async with get_db_async() as db:
        response = await proxy_request(db, name, arguments)
    return await adapte_deepopen_tool(response.data)


@mcp_app.call_tool()
async def fetch_tool(
    name: str, arguments: dict
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    logging.info("fetch_tool: %s, %s", name, arguments)
    return await execute_api_tool(
        name, arguments
    )


@mcp_app.list_tools()
async def list_tools() -> list[types.Tool]:
    logging.info("list_tools")
    async with get_db_async() as db:
        tools = db.query(DeepOpenTool).all()
        logging.info("tools: %s", [tool.to_dict() for tool in tools])
        return [
            types.Tool(
                name=tool.name,
                description=tool.description,
                inputSchema=tool.input_schema,
            )
            for tool in tools
        ]


async def handle_sse(request: Request):
    async with sse.connect_sse(
        request.scope, request.receive, request._send
    ) as streams:
        await mcp_app.run(
            streams[0], streams[1], mcp_app.create_initialization_options()
        )
    return Response()


starlette_app = Starlette(
    debug=True,
    routes=[
        Route("/sse", endpoint=handle_sse, methods=["GET"]),
        Mount("/messages/", app=sse.handle_post_message),
    ],
)
