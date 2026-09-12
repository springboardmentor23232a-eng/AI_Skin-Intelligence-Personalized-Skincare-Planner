import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine
from sqlalchemy import text

def inspect_db():
    with engine.connect() as conn:
        print('DB_URL:', engine.url)
        res = conn.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        """))
        print('\nUSERS TABLE COLUMNS:')
        for row in res:
            print(f'  {row[0]}: {row[1]}, nullable={row[2]}, default={row[3]}')

        res_audit = conn.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'admin_audit_logs'
            ORDER BY ordinal_position;
        """))
        print('\nADMIN_AUDIT_LOGS TABLE COLUMNS:')
        for row in res_audit:
            print(f'  {row[0]}: {row[1]}, nullable={row[2]}, default={row[3]}')

        res_fk = conn.execute(text("""
            SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                rc.delete_rule
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.referential_constraints AS rc
                ON tc.constraint_name = rc.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'admin_audit_logs';
        """))
        print('\nADMIN_AUDIT_LOGS FOREIGN KEYS:')
        for row in res_fk:
            print(f'  {row[0]}: {row[1]} -> {row[2]}.{row[3]} (ON DELETE {row[4]})')

        res_alembic = conn.execute(text("SELECT version_num FROM alembic_version;"))
        for row in res_alembic:
            print(f'\nALEMBIC CURRENT HEAD IN DB: {row[0]}')

if __name__ == '__main__':
    inspect_db()
