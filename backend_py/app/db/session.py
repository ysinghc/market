from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import ssl

# Create an SSL context for NeonDB
ssl_context = ssl.create_default_context()
ssl_context.verify_mode = ssl.CERT_REQUIRED

# Create SQLAlchemy engine with the DATABASE_URL and SSL configuration
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Enable connection health checks
    pool_size=5,  # Adjust based on your needs
    max_overflow=10,  # Adjust based on your needs
    connect_args={
        "ssl": ssl_context,
        "connect_timeout": 10  # Timeout in seconds
    }
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 