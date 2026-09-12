"""create product_recommendations table

Revision ID: 7145b803c9e2
Revises: 6034a702b8d1
Create Date: 2026-08-02 09:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7145b803c9e2'
down_revision: Union[str, Sequence[str], None] = '6034a702b8d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'product_recommendations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('budget_tier', sa.String(length=50), nullable=False, server_default='ALL'),
        sa.Column('recommended_products', sa.JSON(), nullable=False),
        sa.Column('overall_match_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_recommendations_id'), 'product_recommendations', ['id'], unique=False)
    op.create_index(op.f('ix_product_recommendations_user_id'), 'product_recommendations', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_product_recommendations_user_id'), table_name='product_recommendations')
    op.drop_index(op.f('ix_product_recommendations_id'), table_name='product_recommendations')
    op.drop_table('product_recommendations')
