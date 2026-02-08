"""Add validation tracking tables and approval fields

Revision ID: 008_add_validation_tracking
Revises: 007_assign_workshops
Create Date: 2026-02-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '008_add_validation_tracking'
down_revision = '007_assign_workshops'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create artisan_validations table
    op.create_table(
        'artisan_validations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('artisan_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('validation_type', sa.String(50), nullable=False, comment='profile/product/workshop'),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True, comment='ID of product/workshop if applicable'),
        sa.Column('status', sa.String(20), nullable=False, comment='pending/approved/rejected'),
        sa.Column('validated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('validation_notes', sa.Text(), nullable=True),
        sa.Column('validated_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['artisan_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['validated_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_artisan_validations_artisan_id', 'artisan_validations', ['artisan_id'])
    op.create_index('ix_artisan_validations_status', 'artisan_validations', ['status'])
    op.create_index('ix_artisan_validations_validation_type', 'artisan_validations', ['validation_type'])
    op.create_index('ix_artisan_validations_validated_by', 'artisan_validations', ['validated_by'])

    # Add approval fields to users table (for artisan profile approval)
    op.add_column('users', sa.Column('approved_by', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('users', sa.Column('approved_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('approval_notes', sa.Text(), nullable=True))
    op.create_foreign_key('fk_users_approved_by', 'users', 'users', ['approved_by'], ['id'], ondelete='SET NULL')
    op.create_index('ix_users_approved_by', 'users', ['approved_by'])

    # Add approval fields to products table
    op.add_column('products', sa.Column('approved_by', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('products', sa.Column('approved_at', sa.DateTime(), nullable=True))
    op.add_column('products', sa.Column('approval_notes', sa.Text(), nullable=True))
    op.create_foreign_key('fk_products_approved_by', 'products', 'users', ['approved_by'], ['id'], ondelete='SET NULL')
    op.create_index('ix_products_approved_by', 'products', ['approved_by'])

    # Add approval fields to workshops table
    op.add_column('workshops', sa.Column('approved_by', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('workshops', sa.Column('approved_at', sa.DateTime(), nullable=True))
    op.add_column('workshops', sa.Column('approval_notes', sa.Text(), nullable=True))
    op.create_foreign_key('fk_workshops_approved_by', 'workshops', 'users', ['approved_by'], ['id'], ondelete='SET NULL')
    op.create_index('ix_workshops_approved_by', 'workshops', ['approved_by'])


def downgrade() -> None:
    # Drop approval fields from workshops
    op.drop_index('ix_workshops_approved_by', 'workshops')
    op.drop_constraint('fk_workshops_approved_by', 'workshops', type_='foreignkey')
    op.drop_column('workshops', 'approval_notes')
    op.drop_column('workshops', 'approved_at')
    op.drop_column('workshops', 'approved_by')

    # Drop approval fields from products
    op.drop_index('ix_products_approved_by', 'products')
    op.drop_constraint('fk_products_approved_by', 'products', type_='foreignkey')
    op.drop_column('products', 'approval_notes')
    op.drop_column('products', 'approved_at')
    op.drop_column('products', 'approved_by')

    # Drop approval fields from users
    op.drop_index('ix_users_approved_by', 'users')
    op.drop_constraint('fk_users_approved_by', 'users', type_='foreignkey')
    op.drop_column('users', 'approval_notes')
    op.drop_column('users', 'approved_at')
    op.drop_column('users', 'approved_by')

    # Drop artisan_validations table
    op.drop_index('ix_artisan_validations_validated_by', 'artisan_validations')
    op.drop_index('ix_artisan_validations_validation_type', 'artisan_validations')
    op.drop_index('ix_artisan_validations_status', 'artisan_validations')
    op.drop_index('ix_artisan_validations_artisan_id', 'artisan_validations')
    op.drop_table('artisan_validations')
