from pydantic import BaseModel

class CreateCheckoutSessionRequest(BaseModel):
    plan_id: str

class CheckoutSessionResponse(BaseModel):
    checkout_url: str
