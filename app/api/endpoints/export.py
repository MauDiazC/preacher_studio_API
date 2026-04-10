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

    # --- PALETA SACRED OBSERVATORY ---
    BG_COLOR = RGBColor(13, 11, 31)      # #0D0B1F
    ACCENT_PURPLE = RGBColor(125, 92, 255) # #7D5CFF
    ACCENT_GOLD = RGBColor(255, 184, 120)  # #FFB878
    TEXT_MAIN = RGBColor(255, 255, 255)    # #FFFFFF
    TEXT_DIM = RGBColor(161, 161, 170)     # #A1A1AA

    def apply_sacred_style(slide, is_title=False):
        # Fondo oscuro profundo
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = BG_COLOR
        
        # Pie de página ministerial
        if not is_title:
            left = Inches(0.5)
            top = Inches(7.1)
            width = Inches(9)
            height = Inches(0.3)
            txBox = slide.shapes.add_textbox(left, top, width, height)
            tf = txBox.text_frame
            p = tf.paragraphs[0]
            p.text = "PREACHER STUDIO | Asistencia Homilética Digital"
            p.font.size = Pt(9)
            p.font.color.rgb = TEXT_DIM
            p.alignment = PP_ALIGN.LEFT

    # 1. Diapositiva de Portada
    title_slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(title_slide_layout)
    apply_sacred_style(slide, is_title=True)

    title_shape = slide.shapes.title
    subtitle_shape = slide.placeholders[1]

    title_shape.text = sermon["title"].upper()
    for paragraph in title_shape.text_frame.paragraphs:
        paragraph.font.size = Pt(48)
        paragraph.font.bold = True
        paragraph.font.color.rgb = ACCENT_GOLD # Oro para el título principal
        paragraph.alignment = PP_ALIGN.CENTER

    subtitle_shape.text = f"ANÁLISIS EXEGÉTICO & HOMILÉTICO\n{sermon.get('main_passage') or 'Estudio Bíblico'}"
    for paragraph in subtitle_shape.text_frame.paragraphs:
        paragraph.font.size = Pt(22)
        paragraph.font.color.rgb = TEXT_MAIN
        paragraph.alignment = PP_ALIGN.CENTER

    # 2. Procesamiento de Contenido
    content = sermon.get("content", "")
    # Regex mejorada para detectar secciones académicas (v1.4)
    sections = re.split(r'(\d+\.\s+[A-ZÁÉÍÓÚÑ\s\(\)]+:|VERSIÓN [A-Z0-9\s]+:)', content)
    
    slides_data = []
    for i in range(1, len(sections), 2):
        header = sections[i].strip()
        body = sections[i+1].strip() if i+1 < len(sections) else ""
        if body:
            slides_data.append((header, body))

    # 3. Diapositivas de Cuerpo
    bullet_layout = prs.slide_layouts[1]
    for s_title, s_body in slides_data:
        # Dividir texto largo para evitar desbordamiento (aprox 600 chars por slide)
        chunks = [s_body[i:i+650] for i in range(0, len(s_body), 650)]

        for idx, chunk in enumerate(chunks):
            slide = prs.slides.add_slide(bullet_layout)
            apply_sacred_style(slide)

            shapes = slide.shapes
            title_box = shapes.title
            body_box = shapes.placeholders[1]

            # Estilo del Título de Sección
            title_box.text = s_title + (" (cont.)" if idx > 0 else "")
            title_tf = title_box.text_frame.paragraphs[0]
            title_tf.font.color.rgb = ACCENT_PURPLE
            title_tf.font.size = Pt(32)
            title_tf.font.bold = True

            # Estilo del Cuerpo
            body_tf = body_box.text_frame
            body_tf.text = chunk
            for p in body_tf.paragraphs:
                p.font.size = Pt(18)
                p.font.color.rgb = TEXT_MAIN
                p.space_after = Pt(10)

    # 4. Diapositiva de Cierre
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    apply_sacred_style(slide, is_title=True)
    
    left = Inches(2)
    top = Inches(3)
    width = Inches(6)
    height = Inches(1.5)
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = "SOLI DEO GLORIA"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GOLD
    p.alignment = PP_ALIGN.CENTER

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
