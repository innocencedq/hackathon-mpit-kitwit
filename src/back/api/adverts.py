from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from datetime import datetime
from db import AdvertSchema, Advert, User, UserSchema

router = APIRouter(prefix="/api/advert")

def serialize_advert(advert):
    data = advert.model_dump()
    
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.isoformat()
    
    return data

@router.get("/get/all")
async def get_all_adverts(request: Request) -> JSONResponse:
    objs = await AdvertSchema.from_queryset(Advert.all())
    return JSONResponse({
        "adverts": [serialize_advert(obj) for obj in objs]
    })

@router.get("/get/{advert_id}")
async def get_advert(request: Request, advert_id: int) -> JSONResponse:
    try:
        obj = await AdvertSchema.from_tortoise_orm(await Advert.get(id=advert_id))
        return JSONResponse({"advert": serialize_advert(obj)})
    except Advert.DoesNotExist:
        return JSONResponse({"error": "Advert not found"}, status_code=404)

@router.get("/get/user-adverts")
async def get_user_adverts(request: Request) -> JSONResponse:
    owner_id = request.query_params.get("owner_id")
    
    if not owner_id:
        return JSONResponse({"error": "owner_id parameter is required"}, status_code=400)
    
    try:
        adverts = await AdvertSchema.from_queryset(
            Advert.filter(owner_id=int(owner_id)).order_by("-created_at")
        )
        return JSONResponse({
            "adverts": [serialize_advert(advert) for advert in adverts]
        })
    except ValueError:
        return JSONResponse({"error": "Invalid owner_id format"}, status_code=400)

@router.post("/create")
async def create_advert(request: Request) -> JSONResponse:
    try:
        data = await request.json()
        owner_id = data.get("owner_id")
        
        advert = Advert(
            owner_id=owner_id,
            owner_name=data.get("owner_name"),
            title=data.get("title"),
            description=data.get("description"),
            price=data.get("price"),
            deposit=data.get("deposit"),
            period=data.get("period", "день"),
            category=data.get("category"),
            available=data.get("available", True)
        )
        await advert.save()

        user = await User.get(id=owner_id)
        user.adverts += 1
        await user.save()
        
        advert_obj = await AdvertSchema.from_tortoise_orm(advert)
        
        return JSONResponse({
            "message": "Advert created successfully", 
            "advert": serialize_advert(advert_obj)
        }, status_code=201)
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

@router.delete("/delete")
async def delete_advert(request: Request) -> JSONResponse:
    advert_id = request.query_params.get("id")
    
    if not advert_id:
        return JSONResponse({"error": "ID parameter is required"}, status_code=400)
    
    try:
        advert = await Advert.get(id=int(advert_id))
        await advert.delete()
        
        return JSONResponse({
            "message": "Advert deleted successfully",
            "deleted_id": advert_id
        })
        
    except Advert.DoesNotExist:
        return JSONResponse({"error": "Advert not found"}, status_code=404)
    except ValueError:
        return JSONResponse({"error": "Invalid ID format"}, status_code=400)

@router.put("/update/{advert_id}")
async def update_advert(advert_id: int, request: Request) -> JSONResponse:
    try:
        data = await request.json()
        
        advert = await Advert.get(id=advert_id)
        
        update_data = {}
        allowed_fields = ["title", "description", "price", "period", "deposit", "category", "available"]
        
        for field in allowed_fields:
            if field in data:
                setattr(advert, field, data[field])
        
        await advert.save()
        
        advert_obj = await AdvertSchema.from_tortoise_orm(advert)
        
        return JSONResponse({
            "message": "Advert updated successfully",
            "advert": serialize_advert(advert_obj)
        })
        
    except Advert.DoesNotExist:
        return JSONResponse({"error": "Advert not found"}, status_code=404)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)