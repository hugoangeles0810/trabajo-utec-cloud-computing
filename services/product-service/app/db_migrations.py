"""
Database migration utilities
"""
import os
import sys
from alembic.config import Config
from alembic import command
from .database import create_tables, drop_tables
from .config import settings


def run_migrations():
    """Run database migrations"""
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
    command.upgrade(alembic_cfg, "head")


def create_migration(message: str):
    """Create a new migration"""
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
    command.revision(alembic_cfg, autogenerate=True, message=message)


def downgrade_migration(revision: str = "-1"):
    """Downgrade to a specific revision"""
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
    command.downgrade(alembic_cfg, revision)


def show_current_revision():
    """Show current database revision"""
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
    command.current(alembic_cfg)


def show_migration_history():
    """Show migration history"""
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
    command.history(alembic_cfg)


def init_database():
    """Initialize database with tables"""
    create_tables()
    print("Database tables created successfully")


def reset_database():
    """Reset database (drop and recreate all tables)"""
    drop_tables()
    create_tables()
    print("Database reset successfully")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python db_migrations.py <command> [args]")
        print("Commands:")
        print("  init - Initialize database")
        print("  reset - Reset database")
        print("  migrate - Run migrations")
        print("  create <message> - Create new migration")
        print("  downgrade [revision] - Downgrade migration")
        print("  current - Show current revision")
        print("  history - Show migration history")
        sys.exit(1)
    
    command_name = sys.argv[1]
    
    if command_name == "init":
        init_database()
    elif command_name == "reset":
        reset_database()
    elif command_name == "migrate":
        run_migrations()
    elif command_name == "create":
        if len(sys.argv) < 3:
            print("Please provide a migration message")
            sys.exit(1)
        message = sys.argv[2]
        create_migration(message)
    elif command_name == "downgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "-1"
        downgrade_migration(revision)
    elif command_name == "current":
        show_current_revision()
    elif command_name == "history":
        show_migration_history()
    else:
        print(f"Unknown command: {command_name}")
        sys.exit(1)
