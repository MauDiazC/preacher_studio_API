from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.db import supabase
from app.core.security import get_current_user
from app.core.logger import logger

router = APIRouter()

@router.websocket("/ws/sermons/{sermon_id}")
async def sermon_websocket(websocket: WebSocket, sermon_id: str, token: str = Query(...)):
    try:
        # Validar pastor antes de aceptar
        user_id = await get_current_user(token)
        await websocket.accept()
        logger.info(f"✨ Pastor {user_id} conectado al sermón {sermon_id}")

        while True:
            data = await websocket.receive_json()
            content = data.get("content")
            
            # Persistencia inmediata en Supabase
            supabase.table("sermons").update({"content": content}).eq("id", sermon_id).eq("user_id", user_id).execute()
            
            await websocket.send_json({"status": "saved"})
            
    except WebSocketDisconnect:
        logger.warning(f"⚠️ Conexión cerrada para el sermón {sermon_id}")
    except Exception as e:
        logger.error(f"❌ Error en WebSocket: {e}")
        await websocket.close()