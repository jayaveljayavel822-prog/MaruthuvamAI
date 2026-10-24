from typing import Optional, List
from pydantic import BaseModel


class HealthcarePlaceOut(BaseModel):
    id: str
    name: str
    category: str  # pharmacy, hospital, clinic, jan, lab, emergency
    latitude: float
    longitude: float
    distance_km: Optional[float] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    opening_hours: Optional[str] = None
    has_emergency: bool = False
    maps_url: str


class SpecialtyOut(BaseModel):
    name: str
    search_query: str


class MedicineSearchOut(BaseModel):
    medicine_name: str
    generic_name: Optional[str] = None
    jan_aushadhi_available: bool = True
    trusted_pharmacies: List[str]
    dosage_disclaimer: str
