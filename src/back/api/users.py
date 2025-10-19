from fastapi import APIRouter, Request, Depends
from fastapi.responses import  JSONResponse
from aiogram.utils.web_app import WebAppInitData, safe_parse_webapp_init_data

from .utils import auth, check_user
from db import UserSchema


router = APIRouter(prefix="/api/users", dependencies=[Depends(auth)])


@router.get("/get")
async def get_user(request: Request, auth_data: WebAppInitData = Depends(auth)) -> JSONResponse:
    user = await check_user(auth_data.user.id)
    user_obj = (
        await UserSchema.from_tortoise_orm(user)
    ).model_dump(mode="json")
    print(user_obj)

    return JSONResponse({"user": user_obj})