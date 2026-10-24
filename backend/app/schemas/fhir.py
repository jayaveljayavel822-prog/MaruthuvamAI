from typing import List, Dict, Any
from pydantic import BaseModel


class FhirBundleOut(BaseModel):
    resourceType: str = "Bundle"
    type: str = "collection"
    timestamp: str
    meta: Dict[str, Any]
    total_resources: int
    entry: List[Dict[str, Any]]
