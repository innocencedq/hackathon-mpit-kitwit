from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from bot.handlers import setup_routers as setup_bot
from api import setup_routers as setup_api

from config_reader import config, dp, app

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

dp.include_router(setup_bot())
app.include_router(setup_api())

if __name__ == "__main__":
    uvicorn.run(app, host=config.APP_HOST, port=config.APP_PORT)
    