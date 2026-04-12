from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.core.security import get_current_user
from app.repository.sermon_repository import sermon_repo
from app.core.exceptions import EntityNotFoundException
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from docx import Document
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import io
import re

from app.core.db import get_db

router = APIRouter(prefix="/export", tags=["Exportación"])


from app.worker.tasks import export_sermon_pdf_task, export_sermon_pptx_task
...
@router.get("/{sermon_id}/pdf", summary="Exportar sermón a PDF (Asíncrono)")
async def export_to_pdf(sermon_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    """
    Encola la generación de un PDF. Retorna un task_id.
    """
    user_id = str(user.id)
    # Verificar existencia antes de encolar
    res = sermon_repo.get_by_id(db, sermon_id, user_id)
    if not res.data:
        raise EntityNotFoundException(message="Sermón no encontrado para exportar.")

    task = export_sermon_pdf_task.delay(sermon_id, user_id)
    return {"task_id": task.id, "status": "PENDING"}


@router.get("/{sermon_id}/pptx", summary="Exportar sermón a PowerPoint (Asíncrono)")
async def export_to_pptx(sermon_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    """
    Encola la generación de un PPTX. Retorna un task_id.
    """
    user_id = str(user.id)
    # Verificar existencia antes de encolar
    res = sermon_repo.get_by_id(db, sermon_id, user_id)
    if not res.data:
        raise EntityNotFoundException(message="Sermón no encontrado para exportar.")

    task = export_sermon_pptx_task.delay(sermon_id, user_id)
    return {"task_id": task.id, "status": "PENDING"}
