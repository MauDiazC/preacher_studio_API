from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.core.security import get_current_user
from app.repository.sermon_repository import sermon_repo
from app.core.exceptions import EntityNotFoundException
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from docx import Document
import io

router = APIRouter(prefix="/export", tags=["Exportación"])


@router.get("/{sermon_id}/pdf", summary="Exportar sermón a PDF")
async def export_to_pdf(sermon_id: str, user_id: str = Depends(get_current_user)):
    res = sermon_repo.get_by_id(sermon_id, user_id)
    if not res.data:
        raise EntityNotFoundException(message="Sermón no encontrado para exportar.")

    sermon = res.data
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)

    # Simple PDF generation
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 750, f"Título: {sermon['title']}")

    p.setFont("Helvetica", 12)
    p.drawString(100, 730, f"Pasaje: {sermon.get('main_passage') or 'N/A'}")

    p.setFont("Helvetica", 10)
    text = p.beginText(100, 700)
    lines = sermon.get("content", "").split("\n")
    for line in lines:
        text.textLine(line)
    p.drawText(text)

    p.showPage()
    p.save()

    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=sermon_{sermon_id}.pdf"},
    )


@router.get("/{sermon_id}/word", summary="Exportar sermón a Word (Docx)")
async def export_to_word(sermon_id: str, user_id: str = Depends(get_current_user)):
    res = sermon_repo.get_by_id(sermon_id, user_id)
    if not res.data:
        raise EntityNotFoundException(message="Sermón no encontrado para exportar.")

    sermon = res.data
    doc = Document()
    doc.add_heading(sermon["title"], 0)
    doc.add_paragraph(f"Pasaje: {sermon.get('main_passage') or 'N/A'}")
    doc.add_paragraph(sermon.get("content", ""))

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename=sermon_{sermon_id}.docx"
        },
    )
