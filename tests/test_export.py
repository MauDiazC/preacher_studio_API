import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.security import get_current_user
from unittest.mock import MagicMock, patch
from uuid import uuid4

# Mock user_id
MOCK_USER_ID = str(uuid4())

async def override_get_current_user():
    return MOCK_USER_ID

@pytest.fixture
async def client():
    app.dependency_overrides[get_current_user] = override_get_current_user
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_export_pdf_success(client):
    sermon_id = str(uuid4())
    mock_sermon = {
        "id": sermon_id,
        "title": "Test Sermon",
        "main_passage": "John 3:16",
        "content": "This is a test sermon content."
    }
    
    with patch("app.api.endpoints.export.sermon_repo") as mock_repo:
        mock_repo.get_by_id.return_value.data = mock_sermon
        
        response = await client.get(f"/api/v1/export/{sermon_id}/pdf")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert f"attachment; filename=sermon_{sermon_id}.pdf" in response.headers["content-disposition"]

@pytest.mark.asyncio
async def test_export_pdf_not_found(client):
    sermon_id = str(uuid4())
    
    with patch("app.api.endpoints.export.sermon_repo") as mock_repo:
        mock_repo.get_by_id.return_value.data = None
        
        response = await client.get(f"/api/v1/export/{sermon_id}/pdf")
        
        assert response.status_code == 404
        assert response.json()["error_code"] == "ERR_NOT_FOUND_001"

@pytest.mark.asyncio
async def test_export_word_success(client):
    sermon_id = str(uuid4())
    mock_sermon = {
        "id": sermon_id,
        "title": "Test Sermon",
        "main_passage": "John 3:16",
        "content": "This is a test sermon content."
    }
    
    with patch("app.api.endpoints.export.sermon_repo") as mock_repo:
        mock_repo.get_by_id.return_value.data = mock_sermon
        
        response = await client.get(f"/api/v1/export/{sermon_id}/word")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        assert f"attachment; filename=sermon_{sermon_id}.docx" in response.headers["content-disposition"]

@pytest.mark.asyncio
async def test_export_word_not_found(client):
    sermon_id = str(uuid4())
    
    with patch("app.api.endpoints.export.sermon_repo") as mock_repo:
        mock_repo.get_by_id.return_value.data = None
        
        response = await client.get(f"/api/v1/export/{sermon_id}/word")
        
        assert response.status_code == 404
