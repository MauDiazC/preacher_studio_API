import pytest
from unittest.mock import MagicMock, patch
from app.repository.sermon_repository import SermonRepository
from app.schemas.sermon import SermonCreate, SermonUpdate
from uuid import uuid4


@pytest.fixture
def repo():
    return SermonRepository()


def test_get_all(repo):
    user_id = str(uuid4())
    mock_execute = MagicMock()
    mock_execute.data = []
    mock_execute.count = 0

    with patch("app.repository.sermon_repository.supabase") as mock_supabase:
        # Complex chain for filtering
        query_mock = (
            mock_supabase.table.return_value.select.return_value.eq.return_value
        )
        query_mock.order.return_value.range.return_value.execute.return_value = (
            mock_execute
        )

        result = repo.get_all(user_id, 10, 0)
        assert result.data == []
        mock_supabase.table.assert_called_with("sermons")

def test_get_all_with_all_filters(repo):
    user_id = str(uuid4())
    mock_execute = MagicMock()
    mock_execute.data = []
    mock_execute.count = 0
    
    with patch("app.repository.sermon_repository.supabase") as mock_supabase:
        query_mock = mock_supabase.table.return_value.select.return_value.eq.return_value
        # Mocking the filter chain
        query_mock.or_.return_value.eq.return_value.gte.return_value.lte.return_value.order.return_value.range.return_value.execute.return_value = mock_execute
        
        result = repo.get_all(
            user_id, 10, 0, 
            search="Jesus", 
            status="draft", 
            from_date="2024-01-01", 
            to_date="2024-12-31"
        )
        assert result.data == []
        
        # Verify calls
        query_mock.or_.assert_called_once()

def test_create(repo):
    user_id = str(uuid4())
    sermon = SermonCreate(title="Test", content="Test content")

    with patch("app.repository.sermon_repository.supabase") as mock_supabase:
        mock_supabase.table.return_value.insert.return_value.execute.return_value = {
            "data": [{"id": "123"}]
        }

        result = repo.create(user_id, sermon)
        assert result["data"][0]["id"] == "123"

        # Check that user_id was added to the data
        called_data = mock_supabase.table.return_value.insert.call_args[0][0]
        assert called_data["user_id"] == user_id
        assert called_data["title"] == "Test"


def test_get_by_id(repo):
    user_id = str(uuid4())
    sermon_id = str(uuid4())

    with patch("app.repository.sermon_repository.supabase") as mock_supabase:
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value = {
            "data": {"id": sermon_id}
        }

        result = repo.get_by_id(sermon_id, user_id)
        assert result["data"]["id"] == sermon_id


def test_update(repo):
    user_id = str(uuid4())
    sermon_id = str(uuid4())
    update = SermonUpdate(title="Updated Title")

    with patch("app.repository.sermon_repository.supabase") as mock_supabase:
        mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = {
            "data": [{"id": sermon_id}]
        }

        result = repo.update(sermon_id, user_id, update)
        assert result["data"][0]["id"] == sermon_id

        called_data = mock_supabase.table.return_value.update.call_args[0][0]
        assert "title" in called_data
        assert called_data["title"] == "Updated Title"


def test_delete(repo):
    user_id = str(uuid4())
    sermon_id = str(uuid4())

    with patch("app.repository.sermon_repository.supabase") as mock_supabase:
        mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = {
            "data": []
        }

        result = repo.delete(sermon_id, user_id)
        assert "data" in result


def test_save_history_snapshot(repo):
    sermon_id = str(uuid4())
    content = "Snapshot content"
    label = "v1"

    with patch("app.repository.sermon_repository.supabase") as mock_supabase:
        mock_supabase.table.return_value.insert.return_value.execute.return_value = {
            "data": [{"id": "hist123"}]
        }

        result = repo.save_history_snapshot(sermon_id, content, label)
        assert result["data"][0]["id"] == "hist123"

        mock_supabase.table.assert_called_with("sermon_history")
        called_data = mock_supabase.table.return_value.insert.call_args[0][0]
        assert called_data["sermon_id"] == sermon_id
        assert called_data["content_snapshot"] == content
        assert called_data["version_label"] == label
