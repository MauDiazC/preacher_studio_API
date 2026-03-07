import pytest
from app.schemas.sermon import SermonCreate, SermonUpdate, SermonRead
from uuid import uuid4
from datetime import datetime

def test_sermon_create_validation():
    # Valid data
    data = {"title": "Test Sermon", "main_passage": "John 1:1", "content": "Content"}
    sermon = SermonCreate(**data)
    assert sermon.title == "Test Sermon"
    assert sermon.status == "seed" # default

def test_sermon_update_sanitization():
    # HTML sanitization test (only tags are removed, not content inside)
    data = {"title": "<b>Bold Title</b>", "content": "<script>alert(1)</script>Safe"}
    update = SermonUpdate(**data)
    assert update.title == "Bold Title"
    assert update.content == "alert(1)Safe"
    
    # Cover None case explicitly
    update = SermonUpdate(title=None, content=None, main_passage=None)
    assert update.title is None
    assert update.content is None
    assert update.main_passage is None

def test_sermon_read_config():
    # Test from_attributes config
    mock_id = uuid4()
    mock_user_id = uuid4()
    now = datetime.now()
    
    class MockSermon:
        id = mock_id
        user_id = mock_user_id
        title = "Title"
        main_passage = None
        content = ""
        status = "seed"
        created_at = now
        updated_at = now
        
    read = SermonRead.model_validate(MockSermon())
    assert read.id == mock_id
