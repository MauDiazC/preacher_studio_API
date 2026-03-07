import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.security import get_current_user
from app.core.db import get_db
from unittest.mock import MagicMock, patch
from uuid import uuid4

# Mock user_id
MOCK_USER_ID = str(uuid4())


# Dependency overrides
async def override_get_current_user():
    return MOCK_USER_ID


@pytest.fixture
def mock_db():
    mock = MagicMock()
    return mock


@pytest.fixture
async def client(mock_db):
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = lambda: mock_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_list_sermons(client, mock_db):
    # Setup mock response
    mock_response = MagicMock()
    mock_response.data = [
        {
            "id": str(uuid4()),
            "title": "Sermon 1",
            "user_id": MOCK_USER_ID,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
            "status": "seed",
        }
    ]
    mock_response.count = 1

    with patch("app.api.endpoints.sermons.sermon_repo") as mock_repo:
        mock_repo.get_all.return_value = mock_response

        response = await client.get("/api/v1/sermons/")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["title"] == "Sermon 1"


@pytest.mark.asyncio
async def test_create_sermon(client, mock_db):
    # Setup mock response
    mock_response = MagicMock()
    mock_response.data = [
        {
            "id": str(uuid4()),
            "title": "New Sermon",
            "user_id": MOCK_USER_ID,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
    ]
    mock_db.table.return_value.insert.return_value.execute.return_value = mock_response

    payload = {"title": "New Sermon", "content": "Content"}
    response = await client.post("/api/v1/sermons/", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Sermon"

    # Verify that user_id was passed correctly in the insert
    mock_db.table.return_value.insert.assert_called_once()
    args = mock_db.table.return_value.insert.call_args[0][0]
    assert args["user_id"] == MOCK_USER_ID


@pytest.mark.asyncio
async def test_auto_save_sermon(client, mock_db):
    sermon_id = str(uuid4())
    mock_response = MagicMock()
    mock_response.data = [
        {
            "id": sermon_id,
            "title": "Updated Title",
            "user_id": MOCK_USER_ID,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
    ]
    mock_db.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response

    payload = {"title": "Updated Title"}
    response = await client.patch(f"/api/v1/sermons/{sermon_id}", json=payload)

    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"


@pytest.mark.asyncio
async def test_auto_save_not_found(client, mock_db):
    sermon_id = str(uuid4())
    mock_response = MagicMock()
    mock_response.data = []
    mock_db.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response

    payload = {"title": "Updated Title"}
    response = await client.patch(f"/api/v1/sermons/{sermon_id}", json=payload)

    assert response.status_code == 404
    assert response.json()["error_code"] == "ERR_NOT_FOUND_001"


@pytest.mark.asyncio
async def test_get_ai_assistance(client, mock_db):
    sermon_id = str(uuid4())
    # Mock repository get_by_id (used in get_ai_assistance)
    mock_sermon = {"id": sermon_id, "title": "Test Title", "content": "Test Content"}

    with patch("app.api.endpoints.sermons.sermon_repo") as mock_repo:
        mock_repo.get_by_id.return_value.data = mock_sermon

        with patch(
            "app.api.endpoints.sermons.ai_service", new_callable=MagicMock
        ) as mock_ai:
            from unittest.mock import AsyncMock

            mock_ai.get_suggestions = AsyncMock(
                return_value={
                    "suggested_outline": ["Point 1"],
                    "verses_found": ["John 3:16"],
                    "central_theme": "Love",
                }
            )

            response = await client.post(f"/api/v1/sermons/{sermon_id}/ai-assist")

            assert response.status_code == 200
            assert response.json()["central_theme"] == "Love"
            mock_repo.save_history_snapshot.assert_called_once()


@pytest.mark.asyncio
async def test_list_sermons_with_filters(client, mock_db):
    mock_response = MagicMock()
    mock_response.data = []
    mock_response.count = 0
    
    with patch("app.api.endpoints.sermons.sermon_repo") as mock_repo:
        mock_repo.get_all.return_value = mock_response
        
        response = await client.get("/api/v1/sermons/?search=Jesus&status=draft&from_date=2024-01-01")
        
        assert response.status_code == 200
        mock_repo.get_all.assert_called_once_with(
            user_id=MOCK_USER_ID,
            limit=10,
            offset=0,
            search="Jesus",
            status="draft",
            from_date="2024-01-01",
            to_date=None
        )

@pytest.mark.asyncio
async def test_get_ai_assistance_unavailable(client, mock_db):
    sermon_id = str(uuid4())
    mock_sermon = {"id": sermon_id, "title": "Test Title", "content": "Test Content"}

    with patch("app.api.endpoints.sermons.sermon_repo") as mock_repo:
        mock_repo.get_by_id.return_value.data = mock_sermon

        with patch("app.api.endpoints.sermons.ai_service") as mock_ai:
            mock_ai.get_suggestions.side_effect = Exception("Service Down")

            response = await client.post(f"/api/v1/sermons/{sermon_id}/ai-assist")

            assert response.status_code == 503
            assert response.json()["error_code"] == "ERR_AI_SERVICE_002"

@pytest.mark.asyncio
async def test_get_ai_assistance_profile_data_none(client, mock_db):
    sermon_id = str(uuid4())
    mock_sermon = {"id": sermon_id, "title": "Test Title", "content": "Test Content"}

    with patch("app.api.endpoints.sermons.sermon_repo") as mock_repo:
        mock_repo.get_by_id.return_value.data = mock_sermon
        
        # Mock profile_res but with data being None (edge case in line 128)
        mock_profile_res = MagicMock()
        mock_profile_res.data = None
        mock_db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_profile_res

        with patch("app.api.endpoints.sermons.ai_service") as mock_ai:
            from unittest.mock import AsyncMock
            mock_ai.get_suggestions = AsyncMock(return_value={
                "suggested_outline": [], "verses_found": [], "central_theme": "Theme"
            })

            response = await client.post(f"/api/v1/sermons/{sermon_id}/ai-assist")

            assert response.status_code == 200
            # Should fallback to default style
            mock_ai.get_suggestions.assert_called_once_with(
                title="Test Title", content="Test Content", style="encouraging"
            )

@pytest.mark.asyncio
async def test_get_ai_assistance_not_found(client, mock_db):
    sermon_id = str(uuid4())
    with patch("app.api.endpoints.sermons.sermon_repo") as mock_repo:
        mock_repo.get_by_id.return_value.data = None
        response = await client.post(f"/api/v1/sermons/{sermon_id}/ai-assist")
        assert response.status_code == 404

@pytest.mark.asyncio
async def test_create_snapshot_success(client, mock_db):
    sermon_id = str(uuid4())
    mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value.data = {"content": "Content"}
    
    with patch("app.api.endpoints.sermons.sermon_repo"):
        response = await client.post(f"/api/v1/sermons/{sermon_id}/snapshot?label=Test")
        assert response.status_code == 200
        assert response.json()["status"] == "Snapshot programado correctamente"

@pytest.mark.asyncio
async def test_create_snapshot_not_found(client, mock_db):
    sermon_id = str(uuid4())
    mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value.data = None
    
    response = await client.post(f"/api/v1/sermons/{sermon_id}/snapshot?label=Test")
    assert response.status_code == 404
