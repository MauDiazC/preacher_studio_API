"""add stripe_customer_id to profiles

Revision ID: 013b050c7f61
Revises: a1b2c3d4e5f6
Create Date: 2026-04-10 11:53:57.290076

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '013b050c7f61'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('profiles', sa.Column('stripe_customer_id', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('last_payment_date', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('profiles', 'last_payment_date')
    op.drop_column('profiles', 'stripe_customer_id')
