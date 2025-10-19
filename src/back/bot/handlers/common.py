from aiogram import Router
from aiogram.types import Message
from aiogram.filters import CommandStart, Command

from bot.keyboards import main_markup
from config_reader import bot
from db import User

router = Router(name="common")


@router.message(CommandStart())
async def start(message: Message) -> None:
    user = await User.filter(id=message.from_user.id).exists()
    if not user:
        await User.create(
            id=message.from_user.id,
            name=message.from_user.first_name,
            username=message.from_user.username
        )
    await message.answer("kitwiz", reply_markup=main_markup)