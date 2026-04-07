"""add key_locations to sermons

Revision ID: 298da1f50f6b
Revises: 81d34e62e97b
Create Date: 2026-04-07 16:50:16.773630

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '298da1f50f6b'
down_revision: Union[str, Sequence[str], None] = '81d34e62e97b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('sermons', sa.Column('key_locations', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('sermons', 'key_locations')
