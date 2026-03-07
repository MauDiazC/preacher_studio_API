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


class ProfileBase(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    mentorship_style: Optional[str] = Field(
        "encouraging",
        description="Estilo de mentoría preferido (encouraging, academic, practical)",
    )


class ProfileRead(ProfileBase):
    id: UUID
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProfileUpdate(ProfileBase):
    pass
