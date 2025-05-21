from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GlobalSettingsBase(BaseModel):
    value: Optional[bool] = None
    updated_by: Optional[str] = None

class GlobalSettingsCreate(GlobalSettingsBase):
    key_name: str

class GlobalSettingsUpdate(GlobalSettingsBase):
    pass

class GlobalSettingsResponse(GlobalSettingsBase):
    key_name: str
    updated_at: datetime

    class Config:
        from_attributes = True
