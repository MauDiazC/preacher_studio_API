from fastapi import APIRouter, Depends, HTTPException
from celery.result import AsyncResult
from app.core.celery_app import celery_app
from app.core.security import get_current_user
from pydantic import BaseModel
from typing import Any, Optional

router = APIRouter(prefix="/tasks", tags=["Tareas Asíncronas"])

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[Any] = None
    error: Optional[str] = None

@router.get("/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: str,
    user=Depends(get_current_user)
):
    """
    Consulta el estado y resultado de una tarea de Celery.
    """
    result = AsyncResult(task_id, app=celery_app)
    
    response = {
        "task_id": task_id,
        "status": result.status,
    }

    if result.ready():
        if result.successful():
            response["result"] = result.result
        else:
            response["status"] = "FAILURE"
            response["error"] = str(result.result)
            
    return response
