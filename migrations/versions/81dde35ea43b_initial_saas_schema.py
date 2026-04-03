"""Initial SaaS schema

Revision ID: 81dde35ea43b
Revises: 
Create Date: 2026-04-02 17:32:43.979690

"""
from typing import Sequence, Union
import json
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '81dde35ea43b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Limpieza de tablas obsoletas (si existen)
    op.execute("DROP TABLE IF EXISTS ai_metrics")
    op.execute("DROP TABLE IF EXISTS sermon_history")
    op.execute("DROP TABLE IF EXISTS llm_logs")
    op.execute("DROP TABLE IF EXISTS usage_logs")
    op.execute("DROP TABLE IF EXISTS plans")

    # 2. Crear tabla de Planes
    op.create_table('plans',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('price_id', sa.String(), nullable=True),
        sa.Column('max_queries', sa.Integer(), nullable=True),
        sa.Column('max_sermons', sa.Integer(), nullable=True),
        sa.Column('features', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # 3. Actualizar perfiles (manteniendo UUID)
    # Intentamos añadir columnas una por una para evitar errores si ya existen
    op.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR UNIQUE")
    op.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false")
    op.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_id VARCHAR REFERENCES plans(id)")
    op.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_remaining INTEGER DEFAULT 3")
    op.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR DEFAULT 'active'")
    op.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE")
    op.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR DEFAULT 'es'")
    op.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now()")

    # 4. Crear tabla de Logs de Uso (con user_id como UUID)
    op.create_table('usage_logs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action_type', sa.String(), nullable=False),
        sa.Column('verse_reference', sa.String(), nullable=True),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Seed Data
    plans_table = sa.table('plans',
        sa.column('id', sa.String),
        sa.column('name', sa.String),
        sa.column('max_queries', sa.Integer),
        sa.column('max_sermons', sa.Integer),
        sa.column('features', sa.JSON)
    )

    op.bulk_insert(plans_table, [
        {'id': 'plan_sembrador', 'name': 'Sembrador', 'max_queries': 3, 'max_sermons': 1, 'features': json.dumps(['3 consultas'])},
        {'id': 'plan_mentor', 'name': 'Mentor', 'max_queries': 50, 'max_sermons': 9999, 'features': json.dumps(['50 consultas'])},
        {'id': 'plan_exegeta', 'name': 'Exégeta', 'max_queries': 9999, 'max_sermons': 9999, 'features': json.dumps(['Ilimitado'])}
    ])

    # Admin seed
    op.execute("UPDATE profiles SET is_admin = true, plan_id = 'plan_exegeta' WHERE email = 'mdiazcabr@gmail.com'")


def downgrade() -> None:
    op.drop_table('usage_logs')
    op.drop_table('plans')
