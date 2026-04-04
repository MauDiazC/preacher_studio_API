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

from app.core.db import get_db

router = APIRouter(prefix="/export", tags=["Exportación"])


@router.get("/{sermon_id}/pdf", summary="Exportar sermón a PDF")
async def export_to_pdf(sermon_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    user_id = str(user.id)
    res = sermon_repo.get_by_id(db, sermon_id, user_id)
    if not res.data:
        raise EntityNotFoundException(message="Sermón no encontrado para exportar.")

    sermon = res.data
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)

    # Generación simple de PDF
    p.setFont("Helvetica-Bold", 18)
    p.drawString(50, 750, sermon['title'])

    p.setFont("Helvetica-Oblique", 12)
    p.drawString(50, 730, f"Pasaje: {sermon.get('main_passage') or 'N/A'}")

    p.setFont("Helvetica", 11)
    text_object = p.beginText(50, 700)
    content = sermon.get("content", "")
    for line in content.split("\n"):
        text_object.textLine(line)
    p.drawText(text_object)

    p.showPage()
    p.save()

    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=sermon_{sermon_id}.pdf"},
    )


@router.get("/{sermon_id}/pptx", summary="Exportar sermón a PowerPoint (Compatible con Keynote)")
async def export_to_pptx(sermon_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    user_id = str(user.id)
    res = sermon_repo.get_by_id(db, sermon_id, user_id)
    if not res.data:
        raise EntityNotFoundException(message="Sermón no encontrado para exportar.")

    sermon = res.data
    prs = Presentation()

    # Colores del tema
    bg_color = RGBColor(13, 11, 31) # #0D0B1F
    text_color = RGBColor(255, 255, 255) # White
    accent_color = RGBColor(125, 92, 255) # Purple #7D5CFF

    def apply_slide_background(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = bg_color

    # Diapositiva de Título
    title_slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(title_slide_layout)
    apply_slide_background(slide)

    title = slide.shapes.title
    subtitle = slide.placeholders[1]

    title.text = sermon["title"]
    for paragraph in title.text_frame.paragraphs:
        paragraph.font.size = Pt(44)
        paragraph.font.bold = True
        paragraph.font.color.rgb = accent_color
        paragraph.alignment = PP_ALIGN.CENTER

    subtitle.text = f"Análisis Exegético\nPasaje: {sermon.get('main_passage') or 'N/A'}"
    for paragraph in subtitle.text_frame.paragraphs:
        paragraph.font.size = Pt(24)
        paragraph.font.color.rgb = text_color
        paragraph.alignment = PP_ALIGN.CENTER

    # Diapositivas de Contenido
    content = sermon.get("content", "")
    # Dividir por bloques de títulos (detectados por el formato que inyectamos en el editor)
    # Buscamos patrones como "X. TITULO:" o "VERSION XXX:"
    import re
    blocks = re.split(r'(\d+\.\s+[A-ZÁÉÍÓÚÑ\s\(\)]+:|VERSIÓN [A-Z0-9\s]+:)', content)

    # Re-combinar títulos con su contenido
    slides_data = []
    current_title = "Detalles"
    for i in range(1, len(blocks), 2):
        title_text = blocks[i].strip()
        body_text = blocks[i+1].strip() if i+1 < len(blocks) else ""
        if body_text:
            slides_data.append((title_text, body_text))

    bullet_slide_layout = prs.slide_layouts[1]
    for s_title, s_body in slides_data:
        # Si el cuerpo es muy largo, lo dividimos en varias diapositivas
        body_chunks = [s_body[i:i+500] for i in range(0, len(s_body), 500)]

        for idx, chunk in enumerate(body_chunks):
            slide = prs.slides.add_slide(bullet_slide_layout)
            apply_slide_background(slide)

            shapes = slide.shapes
            title_shape = shapes.title
            body_shape = shapes.placeholders[1]

            title_suffix = f" (cont.)" if idx > 0 else ""
            title_shape.text = s_title + title_suffix
            title_shape.text_frame.paragraphs[0].font.color.rgb = accent_color
            title_shape.text_frame.paragraphs[0].font.size = Pt(32)

            tf = body_shape.text_frame
            tf.text = chunk
            for paragraph in tf.paragraphs:
                paragraph.font.size = Pt(20)
                paragraph.font.color.rgb = text_color

    buffer = io.BytesIO()
    prs.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={
            "Content-Disposition": f"attachment; filename=sermon_{sermon_id}.pptx"
        },
    )

    )
