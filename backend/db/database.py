from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from core.config import core_setting_config

connect_args = (
    {"check_same_thread": False}
    if "sqlite" in core_setting_config.DATABASE_URL
    else {}
)
engine = create_engine(
    core_setting_config.DATABASE_URL,
    echo=True,
    connect_args=connect_args,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
