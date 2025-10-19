from fastapi import APIRouter

from . import common, users, adverts, chats

def setup_routers() -> APIRouter:
    router = APIRouter()

    router.include_router(common.router)
    router.include_router(users.router)
    router.include_router(adverts.router)
    router.include_router(chats.router)
    return router