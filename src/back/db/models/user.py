from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator


class User(Model):
    id = fields.BigIntField(pk=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    name = fields.CharField(64)
    balance = fields.IntField(default=0)
    blocked = fields.BooleanField(default=False)
    username = fields.CharField(128)
    deals = fields.IntField(default=0)
    adverts = fields.IntField(default=0)
    user_pic = fields.CharField(max_length=512, default=None, null=True)

    
    class Meta:
        table = "users"


UserSchema = pydantic_model_creator(User)