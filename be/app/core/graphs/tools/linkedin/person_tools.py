"""LangGraph-compatible LinkedIn Person Enrichment tools."""

from typing import Dict, Any
from langchain_core.tools import tool
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import make_lix_request


@tool
def enrich_person(profile_url: str) -> Dict[str, Any]:
    """Enrich person data from LinkedIn profile URL.
    
    Args:
        profile_url: LinkedIn profile URL to get detailed person information
        
    Returns:
        Dict containing enriched person data from LinkedIn
    """
    if not profile_url:
        return {"error": "Profile URL is required"}
    
    params = {"profile_link": profile_url}
    return make_lix_request("person", params)


@tool
def enrich_person_extended(profile_url: str) -> Dict[str, Any]:
    """Get extended person enrichment data including additional details.
    
    Args:
        profile_url: LinkedIn profile URL to get extended person information
        
    Returns:
        Dict containing extended person data from LinkedIn
    """
    if not profile_url:
        return {"error": "Profile URL is required"}
    
    params = {"profile_link": profile_url}
    return make_lix_request("person-extended", params)


@tool
def get_person_ids(person_id: str) -> Dict[str, Any]:
    """Retrieve person IDs for various B2B data products.
    
    Args:
        person_id: Person ID to get LinkedIn and other platform IDs
        
    Returns:
        Dict containing person IDs for various B2B platforms
    """
    if not person_id:
        return {"error": "Person ID is required"}
    
    params = {"person_id": person_id}
    return make_lix_request("disambiguation/person-ids", params)
