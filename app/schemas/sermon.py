from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
import re


class SermonBase(BaseModel):
    title: str = Field(
        ...,
        min_length=3,
        max_length=200,
        description="Título descriptivo del sermón.",
        examples=["La Parábola del Sembrador"],
    )
    main_passage: Optional[str] = Field(
        None,
        max_length=100,
        description="Referencia bíblica principal.",
        examples=["Mateo 13:1-23"],
    )
    content: Optional[str] = Field(
        "",
        max_length=50000,
        description="Cuerpo o notas del sermón.",
        examples=[
            "En este sermón exploramos la importancia de un corazón receptivo..."
        ],
    )
    status: Optional[str] = Field(
        "seed",
        pattern="^(seed|draft|final)$",
        description="Estado del sermón en el flujo de trabajo.",
        examples=["draft"],
    )
    key_locations: Optional[List[str]] = Field(
        default_factory=list,
        description="Lugares geográficos clave identificados.",
    )

    @field_validator("title", "content", "main_passage")
    @classmethod
    def sanitize_html(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        # Basic HTML tag removal to prevent simple XSS
        return re.sub(r"<[^>]*>", "", v).strip()


class SermonCreate(SermonBase):
    """Esquema para crear un nuevo sermón."""

    pass


class SermonUpdate(BaseModel):
    """Esquema para actualizar un sermón existente de forma parcial."""

    title: Optional[str] = Field(
        None, min_length=3, max_length=200, examples=["Nuevo Título"]
    )
    content: Optional[str] = Field(
        None, max_length=50000, examples=["Contenido actualizado..."]
    )
    main_passage: Optional[str] = Field(None, max_length=100, examples=["Juan 3:16"])
    status: Optional[str] = Field(
        None, pattern="^(seed|draft|final)$", examples=["final"]
    )
    key_locations: Optional[List[str]] = Field(None, examples=[["Ponto", "Galacia"]])

    @field_validator("title", "content", "main_passage")
    @classmethod
    def sanitize_html(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return re.sub(r"<[^>]*>", "", v).strip()


class SermonRead(SermonBase):
    """Esquema de respuesta detallada de un sermón."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID = Field(..., description="ID único del sermón.")
    user_id: UUID = Field(..., description="ID del pastor propietario.")
    created_at: datetime = Field(..., description="Fecha de creación.")
    updated_at: datetime = Field(..., description="Fecha de última actualización.")


class PaginatedSermons(BaseModel):
    """Esquema para respuestas paginadas."""

    total: int = Field(..., description="Número total de sermones encontrados.")
    limit: int = Field(..., description="Límite de resultados por página.")
    offset: int = Field(..., description="Desplazamiento inicial.")
    data: List[SermonRead] = Field(..., description="Lista de sermones.")


class AISuggestionResponse(BaseModel):
    """Esquema de respuesta del mentor homilético (IA)."""

    model_config = ConfigDict(from_attributes=True)

    suggested_outline: List[str] = Field(
        ...,
        description="Puntos principales sugeridos para el bosquejo.",
        examples=[
            ["El llamado a la siembra", "Los diferentes terrenos", "El fruto abundante"]
        ],
    )
    verses_found: List[str] = Field(
        ...,
        description="Versículos bíblicos relevantes encontrados.",
        examples=[["Isaías 55:10", "Marcos 4:1-20"]],
    )
    central_theme: str = Field(
        ...,
        description="Tema central o tesis del sermón.",
        examples=[
            "La efectividad de la Palabra de Dios depende de la disposición del corazón."
        ],
    )


class VerseExegesisRequest(BaseModel):
    """Esquema de solicitud para el análisis exegético de un versículo."""
    verse_reference: str = Field(
        ...,
        description="Referencia del versículo a analizar.",
        examples=["Juan 3:16", "Romanos 8:28"],
        min_length=3,
        max_length=100,
    )
    language: Optional[str] = Field("es", description="Idioma deseado para el análisis.")


class VerseExegesisResponse(BaseModel):
    """Esquema de respuesta detallada de la exégesis de un versículo."""
    literary_type: str = Field(
        ..., description="Tipo literario del texto (ej. poesía, carta, histórico, profético)."
    )
    author: str = Field(..., description="Autor histórico del versículo/libro.")
    purpose: str = Field(..., description="Por qué se escribió (propósito original).")
    historical_context: str = Field(
        ..., description="Contexto histórico, usos y costumbres de la época en que se escribió."
    )
    significance_context: str = Field(
        ..., description="Contexto de significancia, a qué se refería o hacía alusión."
    )
    version_rv1960: str = Field(..., description="Texto en versión Reina Valera 1960.")
    version_nvi: str = Field(..., description="Texto en versión Nueva Versión Internacional.")
    original_languages: str = Field(
        ..., description="Análisis detallado en Griego (NT) o Hebreo (AT) de términos clave."
    )
    source_attribution: str = Field(
        ..., description="Detalle de dónde proviene el análisis (comentarios, tradición teológica)."
    )
    key_locations: List[str] = Field(
        default_factory=list, description="Lista de lugares geográficos clave mencionados en el pasaje o su contexto."
    )


class ProfileBase(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = None
    is_admin: Optional[bool] = False
    plan_id: Optional[str] = None
    credits_remaining: Optional[int] = 3
    mentorship_style: Optional[str] = Field(
        "encouraging",
        description="Estilo de mentoría preferido (encouraging, academic, practical)",
    )


class ProfileRead(ProfileBase):
    id: UUID
    updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ProfileUpdate(ProfileBase):
    pass
