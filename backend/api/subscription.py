from fastapi import APIRouter, Depends

from api.auth import get_principal_id
from services.subscription_service import subscription_service

router = APIRouter(prefix="/subscription", tags=["subscription"])


@router.get("/me")
def get_my_subscription(principal_id: str = Depends(get_principal_id)):
    return subscription_service.get_plan_summary(principal_id)
