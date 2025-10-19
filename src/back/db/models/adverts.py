from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator


class Advert(Model):
    id = fields.IntField(pk=True)
    owner_id = fields.BigIntField()
    owner_name = fields.CharField(64)
    created_at = fields.DatetimeField(auto_now_add=True)
    title = fields.CharField(128)
    description = fields.CharField(512)
    period = fields.CharField(28)
    price = fields.IntField()
    deposit = fields.IntField()
    category = fields.CharField(128)
    available = fields.BooleanField(default=True)
      
      
    class Meta:
        table = "adverts"


AdvertSchema = pydantic_model_creator(Advert)