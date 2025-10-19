from fastapi import APIRouter, Request
from aiogram.types import Update
from pydantic import BaseModel

from config_reader import config, bot, dp

router = APIRouter()


@router.post("/webhook")
async def webhook(request: Request) -> None:
    update = Update.model_validate(await request.json(), context={"bot": bot})
    await dp.feed_update(bot, update)
