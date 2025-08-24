import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.api.v1.api import api_router
from app.core.config import settings
from app.middleware import get_middlewares
from app.utils.logger import logger, logging_config
from app.db.database import engine
from app.db.models import Base


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Application startup and shutdown lifecycle"""
    logger.info("Starting application...")

    # Dev/testing: auto-create tables if they don't exist
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables ensured (create_all)")
    except Exception as e:
        logger.exception(f"Failed to ensure database tables: {e}")

    yield
    logger.info("Shutting down application...")


# Initialize FastAPI app
app = FastAPI(
    title="Synapse AI",
    description="BE Service for Synapse AI",
    version="1.0.0",
    lifespan=lifespan,
    middleware=get_middlewares(),
)

# Include routers
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    uvicorn.run(app, host=settings.SERVER_HOST, port=settings.SERVER_PORT, log_config=logging_config, access_log=False)
