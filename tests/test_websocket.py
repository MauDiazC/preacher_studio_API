import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch, MagicMock
from app.core.security import create_access_token
from uuid import uuid4
from fastapi import WebSocketDisconnect

client = TestClient(app)


def test_sermon_websocket_success():
    user_id = str(uuid4())
    sermon_id = str(uuid4())
    token = create_access_token({"sub": user_id})

    with patch("app.api.endpoints.websocket_endpoints.supabase") as mock_supabase:
        mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock()

        with client.websocket_connect(
            f"/ws/sermons/{sermon_id}?token={token}"
        ) as websocket:
            websocket.send_json({"content": "Updated content via WS"})
            data = websocket.receive_json()
            assert data == {"status": "saved"}

            mock_supabase.table.assert_called_with("sermons")
            mock_supabase.table.return_value.update.assert_called_with(
                {"content": "Updated content via WS"}
            )

def test_sermon_websocket_pong():
    user_id = str(uuid4())
    sermon_id = str(uuid4())
    token = create_access_token({"sub": user_id})

    with patch("app.api.endpoints.websocket_endpoints.supabase") as mock_supabase:
        with client.websocket_connect(
            f"/ws/sermons/{sermon_id}?token={token}"
        ) as websocket:
            websocket.send_json({"type": "pong"})
            # No response expected for pong, but connection should remain open
            websocket.send_json({"content": "still here"})
            data = websocket.receive_json()
            assert data == {"status": "saved"}


def test_sermon_websocket_invalid_token():
    sermon_id = str(uuid4())
    # No mock needed for supabase as it should fail at auth
    with pytest.raises(
        Exception
    ):  # TestClient raises error on connection failure if not handled
        with client.websocket_connect(f"/ws/sermons/{sermon_id}?token=invalid"):
            pass


def test_sermon_websocket_exception_handling():
    user_id = str(uuid4())
    sermon_id = str(uuid4())
    token = create_access_token({"sub": user_id})

    with patch("app.api.endpoints.websocket_endpoints.supabase") as mock_supabase:
        # Simulate exception during DB update
        mock_supabase.table.side_effect = Exception("DB Error")

        with client.websocket_connect(
            f"/ws/sermons/{sermon_id}?token={token}"
        ) as websocket:
            websocket.send_json({"content": "crash me"})
            # The connection should close due to exception
            with pytest.raises(Exception):
                websocket.receive_json()

def test_sermon_websocket_auth_exception():
    sermon_id = str(uuid4())
    # Mock auth to fail with general exception
    with patch("app.api.endpoints.websocket_endpoints.get_current_user", side_effect=Exception("Auth Crash")):
        with pytest.raises(Exception):
            with client.websocket_connect(f"/ws/sermons/{sermon_id}?token=some-token"):
                pass

@pytest.mark.asyncio
async def test_sermon_websocket_heartbeat_exception():
    user_id = str(uuid4())
    sermon_id = str(uuid4())
    token = create_access_token({"sub": user_id})
    
    with patch("app.api.endpoints.websocket_endpoints.supabase"):
        with patch("asyncio.sleep", side_effect=Exception("Sleep Crash")):
            with client.websocket_connect(f"/ws/sermons/{sermon_id}?token={token}") as websocket:
                # Give it a tiny bit of time for the task to start and crash
                import time
                time.sleep(0.1)
                websocket.send_json({"content": "ping"})
                data = websocket.receive_json()
                assert data == {"status": "saved"}
