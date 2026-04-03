"""Add decrement_credits function

Revision ID: 81d34e62e97b
Revises: 81dde35ea43b
Create Date: 2026-04-03 01:25:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '81d34e62e97b'
down_revision: Union[str, Sequence[str], None] = '81dde35ea43b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Función para decrementar créditos de forma atómica
    op.execute("""
    CREATE OR REPLACE FUNCTION decrement_credits(user_uuid VARCHAR)
    RETURNS void AS $$
    BEGIN
        UPDATE profiles
        SET credits_remaining = credits_remaining - 1
        WHERE id = user_uuid AND credits_remaining > 0 AND is_admin = false;
    END;
    $$ LANGUAGE plpgsql;
    """)


def downgrade() -> None:
    op.execute("DROP FUNCTION IF EXISTS decrement_credits(VARCHAR)")
