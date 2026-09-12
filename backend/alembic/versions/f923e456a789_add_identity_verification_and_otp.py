"""add_identity_verification_and_otp

Revision ID: f923e456a789
Revises: d812e345f678
Create Date: 2026-09-10 19:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f923e456a789'
down_revision: Union[str, Sequence[str], None] = 'd812e345f678'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add identity verification fields to users table
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('phone_number', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('phone_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('users', sa.Column('phone_verified_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('google_subject_id', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_users_google_subject_id'), 'users', ['google_subject_id'], unique=False)

    # 2. Create email_verification_tokens table
    op.create_table(
        'email_verification_tokens',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_email_verification_tokens_id'), 'email_verification_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_email_verification_tokens_user_id'), 'email_verification_tokens', ['user_id'], unique=False)
    op.create_index(op.f('ix_email_verification_tokens_token_hash'), 'email_verification_tokens', ['token_hash'], unique=False)

    # 3. Create phone_otp_verifications table
    op.create_table(
        'phone_otp_verifications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('phone_number', sa.String(length=50), nullable=False),
        sa.Column('otp_hash', sa.String(length=255), nullable=False),
        sa.Column('attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_phone_otp_verifications_id'), 'phone_otp_verifications', ['id'], unique=False)
    op.create_index(op.f('ix_phone_otp_verifications_user_id'), 'phone_otp_verifications', ['user_id'], unique=False)
    op.create_index(op.f('ix_phone_otp_verifications_phone_number'), 'phone_otp_verifications', ['phone_number'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_phone_otp_verifications_phone_number'), table_name='phone_otp_verifications')
    op.drop_index(op.f('ix_phone_otp_verifications_user_id'), table_name='phone_otp_verifications')
    op.drop_index(op.f('ix_phone_otp_verifications_id'), table_name='phone_otp_verifications')
    op.drop_table('phone_otp_verifications')

    op.drop_index(op.f('ix_email_verification_tokens_token_hash'), table_name='email_verification_tokens')
    op.drop_index(op.f('ix_email_verification_tokens_user_id'), table_name='email_verification_tokens')
    op.drop_index(op.f('ix_email_verification_tokens_id'), table_name='email_verification_tokens')
    op.drop_table('email_verification_tokens')

    op.drop_index(op.f('ix_users_google_subject_id'), table_name='users')
    op.drop_column('users', 'google_subject_id')
    op.drop_column('users', 'phone_verified_at')
    op.drop_column('users', 'phone_verified')
    op.drop_column('users', 'phone_number')
    op.drop_column('users', 'email_verified_at')
    op.drop_column('users', 'email_verified')
