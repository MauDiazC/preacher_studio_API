from app.core.db import get_db
from supabase import Client


def test_get_db():
    db = get_db()
    assert isinstance(db, Client)
