"""LangGraph-compatible LinkedIn Person Enrichment tools."""

from typing import Dict, Any, Optional
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import lix_tool, make_lix_request


@lix_tool("enrich_person", "Enrich person data from LinkedIn profile URL or profile ID.")
def enrich_person(profile_link: Optional[str] = None, profile_id: Optional[str] = None) -> Dict[str, Any]:
    """Enrich person data from LinkedIn profile."""
    if not profile_link and not profile_id:
        return {"error": "Either profile_link or profile_id must be provided"}
    
    params = {}
    if profile_link:
        params["profile_link"] = profile_link
    else:
        params["profile_id"] = profile_id
    
    return make_lix_request("person", params)


@lix_tool("enrich_person_extended", "Get extended person enrichment data including additional details.")
def enrich_person_extended(profile_link: Optional[str] = None, profile_id: Optional[str] = None) -> Dict[str, Any]:
    """Get extended person enrichment data."""
    if not profile_link and not profile_id:
        return {"error": "Either profile_link or profile_id must be provided"}
    
    params = {}
    if profile_link:
        params["profile_link"] = profile_link
    else:
        params["profile_id"] = profile_id
    
    return make_lix_request("person-extended", params)


@lix_tool("get_person_ids", "Retrieve person IDs for various B2B data products. Convert between LinkedIn Sales Navigator URLs and LinkedIn profile URLs.")
def get_person_ids(person_id: str) -> Dict[str, Any]:
    """Get person IDs for B2B data products."""
    params = {"person_id": person_id}
    return make_lix_request("disambiguation/person-ids", params)
