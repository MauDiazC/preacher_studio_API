from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.db import supabase
from app.core.security import get_current_user
from app.core.logger import logger
import asyncio

router = APIRouter()


@router.websocket("/ws/sermons/{sermon_id}")
async def sermon_websocket(
    websocket: WebSocket, sermon_id: str, token: str = Query(...)
):
    try:
        # Validar pastor antes de aceptar
        user_id = await get_current_user(token)
        await websocket.accept()
        logger.info(f"✨ Pastor {user_id} conectado al sermón {sermon_id}")

        async def heartbeat():
            """Envía un ping cada 30 segundos para mantener la conexión viva."""
            try:
                while True:
                    await asyncio.sleep(30)
                    await websocket.send_json({"type": "ping"})
            except Exception:
                pass

        # Iniciar latido en segundo plano
        heartbeat_task = asyncio.create_task(heartbeat())

        while True:
            data = await websocket.receive_json()

            # Responder a pongs del cliente si es necesario
            if data.get("type") == "pong":
                continue

            content = data.get("content")

            # Persistencia inmediata en Supabase
            supabase.table("sermons").update({"content": content}).eq(
                "id", sermon_id
            ).eq("user_id", user_id).execute()

            await websocket.send_json({"status": "saved"})

    except WebSocketDisconnect:
        logger.warning(f"⚠️ Conexión cerrada para el sermón {sermon_id}")
    except Exception as e:
        logger.error(f"❌ Error en WebSocket: {e}")
        await websocket.close()
    finally:
        if "heartbeat_task" in locals():
            heartbeat_task.cancel()
