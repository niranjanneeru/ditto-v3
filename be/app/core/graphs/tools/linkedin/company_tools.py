"""LangGraph-compatible LinkedIn Company/Organization tools."""

from typing import Dict, Any, Optional
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import lix_tool, make_lix_request


@lix_tool("enrich_organization", "Enrich organization/company data from LinkedIn company URL or ID.")
def enrich_organization(company_url: Optional[str] = None, company_id: Optional[str] = None) -> Dict[str, Any]:
    """Enrich organization/company data from LinkedIn."""
    if not company_url and not company_id:
        return {"error": "Either company_url or company_id must be provided"}
    
    params = {}
    if company_url:
        params["company_url"] = company_url
    else:
        params["company_id"] = company_id
    
    return make_lix_request("organisation", params)


@lix_tool("get_company_followers", "Retrieve followers for a LinkedIn company.")
def get_company_followers(company_url: str) -> Dict[str, Any]:
    """Get followers for a LinkedIn company."""
    params = {"company_url": company_url}
    return make_lix_request("company/followers", params)


@lix_tool("get_organisation_ids", "Retrieve organisation IDs for various B2B data products and platforms.")
def get_organisation_ids(organisation_id: str) -> Dict[str, Any]:
    """Get organisation IDs for B2B data products."""
    params = {"organisation_id": organisation_id}
    return make_lix_request("disambiguation/organisation-ids", params)
