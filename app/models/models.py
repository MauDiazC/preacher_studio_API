from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    price_id = Column(String, nullable=True)
    max_queries = Column(Integer, default=3)
    max_sermons = Column(Integer, default=1)
    features = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True) # Volvemos a UUID
    email = Column(String, unique=True, nullable=True)
    full_name = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    plan_id = Column(String, ForeignKey("plans.id"), nullable=True)
    credits_remaining = Column(Integer, default=3)
    subscription_status = Column(String, default="active")
    subscription_end = Column(DateTime(timezone=True), nullable=True)
    mentorship_style = Column(String, default="encouraging")
    language = Column(String, default="es")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    plan = relationship("Plan")

class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    action_type = Column(String, nullable=False)
    verse_reference = Column(String, nullable=True)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Sermon(Base):
    __tablename__ = "sermons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    main_passage = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    status = Column(String, default="seed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
