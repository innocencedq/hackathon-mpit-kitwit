from fastapi import APIRouter
from tortoise.expressions import Q
from fastapi.responses import JSONResponse

from db import Chat, Message, UserStatus, ChatSchema, MessageSchema
from typing import List, Dict, Any

router = APIRouter(prefix="/api")


def serialize_chat(chat_obj: ChatSchema, current_user_id: int) -> Dict[str, Any]:
    if chat_obj.user1_id == current_user_id:
        partner_name = chat_obj.user2_name
        partner_id = chat_obj.user2_id
    else:
        partner_name = chat_obj.user1_name
        partner_id = chat_obj.user1_id
    
    return {
        "id": chat_obj.id,
        "name": partner_name,
        "partner_id": partner_id,
        "advert_id": chat_obj.advert_id,
        "created_at": chat_obj.created_at.isoformat() if hasattr(chat_obj.created_at, 'isoformat') else str(chat_obj.created_at),
        "user1_id": chat_obj.user1_id,
        "user2_id": chat_obj.user2_id
    }


def serialize_message(message_obj: MessageSchema, current_user_id: int) -> Dict[str, Any]:
    return {
        "id": message_obj.id,
        "chat_id": message_obj.chat_id,
        "text": message_obj.text,
        "timestamp": message_obj.created_at.strftime("%H:%M") if hasattr(message_obj.created_at, 'strftime') else "00:00",
        "is_own": message_obj.sender_id == current_user_id,
        "read": message_obj.read,
        "sender_id": message_obj.sender_id,
        "created_at": message_obj.created_at.isoformat() if hasattr(message_obj.created_at, 'isoformat') else str(message_obj.created_at)
    }


def serialize_user_status(status_obj) -> Dict[str, Any]:
    return {
        "user_id": status_obj.user_id,
        "user_name": status_obj.user_name,
        "online": status_obj.online,
        "last_seen": status_obj.last_seen.isoformat() if hasattr(status_obj.last_seen, 'isoformat') else str(status_obj.last_seen)
    }


@router.get("/chats/{user_id}")
async def get_user_chats(user_id: int) -> JSONResponse:
    try:
        chats = await ChatSchema.from_queryset(
            Chat.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
        )
        
        serialized_chats = []
        for chat in chats:
            chat_data = serialize_chat(chat, user_id)
            
            last_message = await Message.filter(chat_id=chat.id).order_by('-created_at').first()
            if last_message:
                chat_data["last_message"] = last_message.text
                chat_data["last_message_time"] = last_message.created_at.strftime("%H:%M")
            else:
                chat_data["last_message"] = "Нет сообщений"
                chat_data["last_message_time"] = ""
            
            unread_count = await Message.filter(
                chat_id=chat.id, 
                read=False
            ).exclude(sender_id=user_id).count()
            chat_data["unread_count"] = unread_count
            
            partner_id = chat_data["partner_id"]
            partner_status = await UserStatus.filter(user_id=partner_id).first()
            chat_data["online"] = partner_status.online if partner_status else False
            
            serialized_chats.append(chat_data)
        
        return JSONResponse({
            "success": True,
            "chats": serialized_chats
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/chats/{chat_id}/messages/{user_id}")
async def get_chat_messages(chat_id: int, user_id: int) -> JSONResponse:
    try:
        chat_exists = await Chat.filter(
            Q(id=chat_id, user1_id=user_id) | Q(id=chat_id, user2_id=user_id)
        ).exists()
        
        if not chat_exists:
            return JSONResponse({
                "success": False,
                "error": "Чат не найден"
            }, status_code=404)
        
        messages = await MessageSchema.from_queryset(
            Message.filter(chat_id=chat_id).order_by('created_at')
        )
        
        await Message.filter(
            chat_id=chat_id, 
            read=False
        ).exclude(sender_id=user_id).update(read=True)
        
        serialized_messages = [serialize_message(msg, user_id) for msg in messages]
        
        return JSONResponse({
            "success": True,
            "messages": serialized_messages
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/messages/send")
@router.post("/messages/send")
async def send_message(request: dict) -> JSONResponse:
    try:
        chat_id = request.get("chat_id")
        text = request.get("text")
        sender_id = request.get("sender_id")
        
        if not all([chat_id, text, sender_id]):
            return JSONResponse({
                "success": False,
                "error": "Необходимы chat_id, text и sender_id"
            }, status_code=400)
        
        chat_exists = await Chat.filter(
            Q(id=chat_id, user1_id=sender_id) | Q(id=chat_id, user2_id=sender_id)
        ).exists()
        
        if not chat_exists:
            return JSONResponse({
                "success": False,
                "error": "Чат не найден"
            }, status_code=404)
        
        message = await Message.create(
            chat_id=chat_id,
            sender_id=sender_id,
            text=text
        )
        
        from datetime import datetime
        await Chat.filter(id=chat_id).update(updated_at=datetime.now())
        
        message_schema = await MessageSchema.from_tortoise_orm(message)
        
        return JSONResponse({
            "success": True,
            "message": serialize_message(message_schema, sender_id)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/chats/create")
async def create_chat(request: dict) -> JSONResponse:
    try:
        advert_id = request.get("advert_id")
        user1_id = request.get("user1_id")
        user2_id = request.get("user2_id")
        user1_name = request.get("user1_name")
        user2_name = request.get("user2_name")
        
        if not all([advert_id, user1_id, user2_id, user1_name, user2_name]):
            return JSONResponse({
                "success": False,
                "error": "Необходимы advert_id, user1_id, user2_id, user1_name, user2_name"
            }, status_code=400)
        
        existing_chat = await Chat.filter(
            advert_id=advert_id,
            user1_id=user1_id,
            user2_id=user2_id
        ).first()
        
        if existing_chat:
            chat_schema = await ChatSchema.from_tortoise_orm(existing_chat)
            return JSONResponse({
                "success": True,
                "chat": serialize_chat(chat_schema, user1_id),
                "is_new": False
            })
        
        chat = await Chat.create(
            advert_id=advert_id,
            user1_id=user1_id,
            user2_id=user2_id,
            user1_name=user1_name,
            user2_name=user2_name
        )
        
        chat_schema = await ChatSchema.from_tortoise_orm(chat)
        
        return JSONResponse({
            "success": True,
            "chat": serialize_chat(chat_schema, user1_id),
            "is_new": True
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/chats/search/{user_id}")
async def search_chats(user_id: int, query: str = "") -> JSONResponse:
    try:
        if not query:
            return await get_user_chats(user_id)
        
        chats = await ChatSchema.from_queryset(
            Chat.filter(
                Q(user1_id=user_id, user2_name__icontains=query) |
                Q(user2_id=user_id, user1_name__icontains=query)
            )
        )
        
        serialized_chats = []
        for chat in chats:
            chat_data = serialize_chat(chat, user_id)
            
            last_message = await Message.filter(chat_id=chat.id).order_by('-created_at').first()
            if last_message:
                chat_data["last_message"] = last_message.text
                chat_data["last_message_time"] = last_message.created_at.strftime("%H:%M")
            else:
                chat_data["last_message"] = "Нет сообщений"
                chat_data["last_message_time"] = ""
            
            unread_count = await Message.filter(
                chat_id=chat.id, 
                read=False
            ).exclude(sender_id=user_id).count()
            chat_data["unread_count"] = unread_count
            
            partner_id = chat_data["partner_id"]
            partner_status = await UserStatus.filter(user_id=partner_id).first()
            chat_data["online"] = partner_status.online if partner_status else False
            
            serialized_chats.append(chat_data)
        
        return JSONResponse({
            "success": True,
            "chats": serialized_chats
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/messages/mark-read")
async def mark_as_read(request: dict) -> JSONResponse:
    try:
        chat_id = request.get("chat_id")
        user_id = request.get("user_id")
        
        if not all([chat_id, user_id]):
            return JSONResponse({
                "success": False,
                "error": "Необходимы chat_id и user_id"
            }, status_code=400)
        
        await Message.filter(
            chat_id=chat_id
        ).exclude(sender_id=user_id).update(read=True)
        
        return JSONResponse({
            "success": True,
            "message": "Сообщения помечены как прочитанные"
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/user-status/update")
async def update_user_status(request: dict) -> JSONResponse:
    try:
        user_id = request.get("user_id")
        user_name = request.get("user_name")
        online = request.get("online", False)
        
        if not all([user_id, user_name]):
            return JSONResponse({
                "success": False,
                "error": "Необходимы user_id и user_name"
            }, status_code=400)
        
        status, created = await UserStatus.update_or_create(
            user_id=user_id,
            defaults={
                'user_name': user_name,
                'online': online
            }
        )
        
        return JSONResponse({
            "success": True,
            "status": serialize_user_status(status),
            "is_new": created
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/user-status/{user_id}")
async def get_user_status(user_id: int) -> JSONResponse:
    try:
        status = await UserStatus.filter(user_id=user_id).first()
        if not status:
            return JSONResponse({
                "success": False,
                "error": "Пользователь не найден"
            }, status_code=404)
        
        return JSONResponse({
            "success": True,
            "status": serialize_user_status(status)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)