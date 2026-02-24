from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class SermonBase(BaseModel):
    title: str
    main_passage: Optional[str] = None
    content: Optional[str] = ""
    status: Optional[str] = "seed"

class SermonCreate(SermonBase):
    pass

class SermonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    main_passage: Optional[str] = None
    status: Optional[str] = None

class SermonRead(SermonBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedSermons(BaseModel):
    total: int
    limit: int
    offset: int
    data: List[SermonRead]

class AISuggestionResponse(BaseModel):
    suggested_outline: List[str] = Field(..., description="Puntos principales del sermón")
    verses_found: List[str] = Field(..., description="Versículos sugeridos")
    central_theme: str

    class Config:
        from_attributes = True