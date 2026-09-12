"""add_admin_account_control_and_audit_logs

Revision ID: d812e345f678
Revises: 4c9d107efe69
Create Date: 2026-09-08 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd812e345f678'
down_revision: Union[str, Sequence[str], None] = '4c9d107efe69'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add account control fields to users table
    op.add_column('users', sa.Column('is_active', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('users', sa.Column('is_blocked', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('is_verified', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('users', sa.Column('blocked_reason', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('blocked_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('blocked_by', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('last_login_at', sa.DateTime(), nullable=True))
    op.create_foreign_key('fk_users_blocked_by', 'users', 'users', ['blocked_by'], ['id'], ondelete='SET NULL')

    # 2. Create admin_audit_logs table
    op.create_table(
        'admin_audit_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('admin_user_id', sa.Integer(), nullable=True),
        sa.Column('target_user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('previous_value', sa.Text(), nullable=True),
        sa.Column('new_value', sa.Text(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['admin_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['target_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admin_audit_logs_id'), 'admin_audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_admin_audit_logs_admin_user_id'), 'admin_audit_logs', ['admin_user_id'], unique=False)
    op.create_index(op.f('ix_admin_audit_logs_target_user_id'), 'admin_audit_logs', ['target_user_id'], unique=False)
    op.create_index(op.f('ix_admin_audit_logs_action'), 'admin_audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_admin_audit_logs_created_at'), 'admin_audit_logs', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_admin_audit_logs_created_at'), table_name='admin_audit_logs')
    op.drop_index(op.f('ix_admin_audit_logs_action'), table_name='admin_audit_logs')
    op.drop_index(op.f('ix_admin_audit_logs_target_user_id'), table_name='admin_audit_logs')
    op.drop_index(op.f('ix_admin_audit_logs_admin_user_id'), table_name='admin_audit_logs')
    op.drop_index(op.f('ix_admin_audit_logs_id'), table_name='admin_audit_logs')
    op.drop_table('admin_audit_logs')

    op.drop_constraint('fk_users_blocked_by', 'users', type_='foreignkey')
    op.drop_column('users', 'last_login_at')
    op.drop_column('users', 'blocked_by')
    op.drop_column('users', 'blocked_at')
    op.drop_column('users', 'blocked_reason')
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'is_blocked')
    op.drop_column('users', 'is_active')
