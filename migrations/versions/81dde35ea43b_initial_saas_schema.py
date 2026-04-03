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
    """Upgrade schema."""
    # 1. Limpieza de tablas obsoletas (si existen)
    op.execute("DROP TABLE IF EXISTS ai_metrics")
    op.execute("DROP TABLE IF EXISTS sermon_history")
    op.execute("DROP TABLE IF EXISTS llm_logs")

    # 2. Cambiar tipos de datos de UUID a String en tablas existentes
    # Primero en profiles (la tabla principal)
    op.alter_column('profiles', 'id',
               existing_type=sa.UUID(),
               type_=sa.String(),
               existing_nullable=False)
    
    # Luego en sermons (que depende de profiles)
    op.alter_column('sermons', 'id',
               existing_type=sa.UUID(),
               type_=sa.String(),
               existing_nullable=False)
    op.alter_column('sermons', 'user_id',
               existing_type=sa.UUID(),
               type_=sa.String(),
               nullable=False)

    # 3. Crear tabla de Planes
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

    # 4. Actualizar columnas de profiles para el SaaS
    op.add_column('profiles', sa.Column('email', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('is_admin', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('profiles', sa.Column('plan_id', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('credits_remaining', sa.Integer(), nullable=True, server_default='3'))
    op.add_column('profiles', sa.Column('subscription_status', sa.String(), nullable=True, server_default='active'))
    op.add_column('profiles', sa.Column('subscription_end', sa.DateTime(timezone=True), nullable=True))
    op.add_column('profiles', sa.Column('language', sa.String(), nullable=True, server_default='es'))
    op.add_column('profiles', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    
    op.create_unique_constraint(None, 'profiles', ['email'])
    op.create_foreign_key(None, 'profiles', 'plans', ['plan_id'], ['id'])

    # 5. Crear tabla de Logs de Uso (ahora sí los tipos coinciden)
    op.create_table('usage_logs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('action_type', sa.String(), nullable=False),
        sa.Column('verse_reference', sa.String(), nullable=True),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # 6. SEED DATA: Planes y Admin
    plans_table = sa.table('plans',
        sa.column('id', sa.String),
        sa.column('name', sa.String),
        sa.column('max_queries', sa.Integer),
        sa.column('max_sermons', sa.Integer),
        sa.column('features', sa.JSON)
    )

    op.bulk_insert(plans_table, [
        {
            'id': 'plan_sembrador',
            'name': 'Sembrador',
            'max_queries': 3,
            'max_sermons': 1,
            'features': json.dumps(['Consultas básicas', '1 Sermón'])
        },
        {
            'id': 'plan_mentor',
            'name': 'Mentor',
            'max_queries': 50,
            'max_sermons': 9999,
            'features': json.dumps(['Exégesis profunda', 'Sermones ilimitados', 'PDF'])
        },
        {
            'id': 'plan_exegeta',
            'name': 'Exégeta',
            'max_queries': 9999,
            'max_sermons': 9999,
            'features': json.dumps(['Todo lo anterior', 'Keynote', 'Acceso Beta', 'Estilo Pro'])
        }
    ])

    # Configurar Admin Bypass
    op.execute("UPDATE profiles SET is_admin = true, plan_id = 'plan_exegeta' WHERE email = 'mdiazcabr@gmail.com'")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('usage_logs')
    op.drop_constraint(None, 'profiles', type_='foreignkey')
    op.drop_column('profiles', 'email')
    op.drop_column('profiles', 'is_admin')
    op.drop_column('profiles', 'plan_id')
    op.drop_table('plans')
