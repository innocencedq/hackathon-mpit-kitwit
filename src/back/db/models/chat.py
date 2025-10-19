from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator
from datetime import datetime
from typing import List, Optional


class Chat(Model):
    id = fields.IntField(pk=True)
    advert_id = fields.IntField()
    user1_id = fields.BigIntField()
    user2_id = fields.BigIntField()
    user1_name = fields.CharField(64)
    user2_name = fields.CharField(64)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "chats"


class Message(Model):
    id = fields.IntField(pk=True)
    chat_id = fields.IntField()
    sender_id = fields.BigIntField()
    text = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)
    read = fields.BooleanField(default=False)
    
    class Meta:
        table = "messages"


class UserStatus(Model):
    id = fields.IntField(pk=True)
    user_id = fields.BigIntField(unique=True)
    user_name = fields.CharField(64)
    online = fields.BooleanField(default=False)
    last_seen = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "user_statuses"


ChatSchema = pydantic_model_creator(Chat)
MessageSchema = pydantic_model_creator(Message)
UserStatusSchema = pydantic_model_creator(UserStatus)