from fastapi import APIRouter

from api.guest_auth import GuestTokenBody, issue_guest_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/guest")
def create_guest_session(body: GuestTokenBody = GuestTokenBody()):
    return issue_guest_token(body.guestId)
