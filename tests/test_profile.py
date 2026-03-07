import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.security import get_current_user
from unittest.mock import MagicMock, patch
from uuid import uuid4
from datetime import datetime

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
async def test_get_profile_exists(client):
    mock_profile = {
        "id": MOCK_USER_ID,
        "full_name": "Pastor Test",
        "mentorship_style": "encouraging",
        "updated_at": datetime.now().isoformat()
    }
    
    with patch("app.api.endpoints.profile.supabase") as mock_supabase:
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [mock_profile]
        
        response = await client.get("/api/v1/profile/")
        
        assert response.status_code == 200
        assert response.json()["full_name"] == "Pastor Test"

@pytest.mark.asyncio
async def test_get_profile_not_exists_creates_it(client):
    mock_profile = {
        "id": MOCK_USER_ID,
        "full_name": None,
        "mentorship_style": "encouraging",
        "updated_at": datetime.now().isoformat()
    }
    
    with patch("app.api.endpoints.profile.supabase") as mock_supabase:
        # First call returns empty list
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        # Insert call returns the new profile
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [mock_profile]
        
        response = await client.get("/api/v1/profile/")
        
        assert response.status_code == 200
        mock_supabase.table.return_value.insert.assert_called_once_with({"id": MOCK_USER_ID})

@pytest.mark.asyncio
async def test_update_profile_success(client):
    mock_profile = {
        "id": MOCK_USER_ID,
        "full_name": "Updated Name",
        "mentorship_style": "academic",
        "updated_at": datetime.now().isoformat()
    }
    
    with patch("app.api.endpoints.profile.supabase") as mock_supabase:
        mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [mock_profile]
        
        payload = {"full_name": "Updated Name", "mentorship_style": "academic"}
        response = await client.put("/api/v1/profile/", json=payload)
        
        assert response.status_code == 200
        assert response.json()["mentorship_style"] == "academic"

@pytest.mark.asyncio
async def test_update_profile_not_found(client):
    with patch("app.api.endpoints.profile.supabase") as mock_supabase:
        mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = []
        
        payload = {"full_name": "Updated Name"}
        response = await client.put("/api/v1/profile/", json=payload)
        
        assert response.status_code == 404
