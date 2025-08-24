from fastapi import APIRouter
from app.api.v1.endpoints import health, webhook, room, leads

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
api_router.include_router(room.router, prefix="/rooms", tags=["rooms"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
