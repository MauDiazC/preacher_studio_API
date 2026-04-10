"""add profile details columns

Revision ID: d47ab7004450
Revises: 013b050c7f61
Create Date: 2026-04-10 13:17:11.111634

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd47ab7004450'
down_revision: Union[str, Sequence[str], None] = '013b050c7f61'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('profiles', sa.Column('ministry_name', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('role_title', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('country', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('profiles', sa.Column('mentorship_style', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('profiles', 'mentorship_style')
    op.drop_column('profiles', 'bio')
    op.drop_column('profiles', 'country')
    op.drop_column('profiles', 'role_title')
    op.drop_column('profiles', 'ministry_name')
