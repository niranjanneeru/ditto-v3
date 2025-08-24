"""LangGraph-compatible LinkedIn Company/Organization tools."""

from typing import Dict, Any
from langchain_core.tools import tool
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import make_lix_request


@tool
def enrich_organization(company_url: str) -> Dict[str, Any]:
    """Enrich organization/company data from LinkedIn company URL.
    
    Args:
        company_url: LinkedIn company URL to get detailed organization information
        
    Returns:
        Dict containing enriched company data from LinkedIn
    """
    if not company_url:
        return {"error": "Company URL is required"}
    
    params = {"company_url": company_url}
    return make_lix_request("organisation", params)


@tool
def get_company_followers(company_url: str) -> Dict[str, Any]:
    """Retrieve followers for a LinkedIn company.
    
    Args:
        company_url: LinkedIn company URL to get follower information
        
    Returns:
        Dict containing company follower data
    """
    if not company_url:
        return {"error": "Company URL is required"}
    
    params = {"company_url": company_url}
    return make_lix_request("company/followers", params)


@tool
def get_organisation_ids(organisation_id: str) -> Dict[str, Any]:
    """Retrieve organisation IDs for various B2B data products and platforms.
    
    Args:
        organisation_id: Organisation ID to get IDs for various platforms
        
    Returns:
        Dict containing organisation IDs for B2B platforms
    """
    if not organisation_id:
        return {"error": "Organisation ID is required"}
    
    params = {"organisation_id": organisation_id}
    return make_lix_request("disambiguation/organisation-ids", params)
