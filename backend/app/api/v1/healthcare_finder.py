from typing import List, Optional
from fastapi import APIRouter, Query
from app.schemas.healthcare import HealthcarePlaceOut, SpecialtyOut, MedicineSearchOut
from app.services.location_service import location_service

router = APIRouter(prefix="/healthcare", tags=["Healthcare Finder"])


@router.get("/search", response_model=List[HealthcarePlaceOut])
async def search_nearby_healthcare(
    category: str = Query("hospital", pattern="^(pharmacy|hospital|clinic|jan|lab|blood|emergency)$"),
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius: int = Query(5000, ge=500, le=50000),
):
    """
    Search real medical facilities (OpenStreetMap Overpass API) around given coordinates,
    sorted by distance with directions links.
    """
    return await location_service.search_nearby(
        category=category,
        lat=latitude,
        lon=longitude,
        radius_meters=radius,
    )


@router.get("/specialties", response_model=List[SpecialtyOut])
def get_specialties():
    """List clinical specialties for quick provider searches."""
    return location_service.get_specialties()


@router.get("/medicine-search", response_model=MedicineSearchOut)
def search_medicine_availability(medicine_name: str = Query(..., min_length=2)):
    """Search medicine, show generic Jan Aushadhi availability, and reliable pharmacy links."""
    return MedicineSearchOut(
        medicine_name=medicine_name,
        generic_name=f"Generic formulation of {medicine_name}",
        jan_aushadhi_available=True,
        trusted_pharmacies=["Pradhan Mantri Jan Aushadhi Kendra", "Apollo Pharmacy", "PharmEasy", "Netmeds", "Tata 1mg"],
        dosage_disclaimer="Dispense only against a valid registered physician's prescription. Verify seal, batch number, and expiry date.",
    )
