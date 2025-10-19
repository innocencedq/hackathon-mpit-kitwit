from aiogram.types import WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder

from config_reader import config

main_markup = (
    InlineKeyboardBuilder()
    .button(text="kitwiz miniapp", web_app=WebAppInfo(url=config.WEBAPP_URL))
).as_markup()