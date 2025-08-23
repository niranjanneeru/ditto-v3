"""LangGraph-compatible LinkedIn Search tools."""

from typing import Dict, Any, Optional
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import lix_tool, make_lix_request


@lix_tool("search_people", "Search for people on LinkedIn using search URL or keywords.")
def search_people(url: Optional[str] = None, keywords: Optional[str] = None) -> Dict[str, Any]:
    """Search for people on LinkedIn."""
    if not url and not keywords:
        return {"error": "Either url or keywords must be provided"}
    
    params = {}
    if url:
        params["url"] = url
    else:
        params["keywords"] = keywords
    
    return make_lix_request("li/linkedin/search/people", params)


@lix_tool("search_jobs", "Search for jobs on LinkedIn using search URL or keywords.")
def search_jobs(url: Optional[str] = None, keywords: Optional[str] = None) -> Dict[str, Any]:
    """Search for jobs on LinkedIn."""
    if not url and not keywords:
        return {"error": "Either url or keywords must be provided"}
    
    params = {}
    if url:
        params["url"] = url
    else:
        params["keywords"] = keywords
    
    return make_lix_request("li/linkedin/search/jobs", params)


@lix_tool("search_companies", "Search for organizations/companies on LinkedIn using search URL or keywords.")
def search_companies(url: Optional[str] = None, keywords: Optional[str] = None) -> Dict[str, Any]:
    """Search for companies/organizations on LinkedIn."""
    if not url and not keywords:
        return {"error": "Either url or keywords must be provided"}
    
    params = {}
    if url:
        params["url"] = url
    else:
        params["keywords"] = keywords
    
    return make_lix_request("li/linkedin/search/organizations", params)


@lix_tool("search_posts", "Search for posts on LinkedIn using search URL or keywords.")
def search_posts(url: Optional[str] = None, keywords: Optional[str] = None) -> Dict[str, Any]:
    """Search for posts on LinkedIn."""
    if not url and not keywords:
        return {"error": "Either url or keywords must be provided"}
    
    params = {}
    if url:
        params["url"] = url
    else:
        params["keywords"] = keywords
    
    return make_lix_request("li/linkedin/search/posts", params)


@lix_tool("search_sales_navigator_leads", "Search for leads using LinkedIn Sales Navigator search URL.")
def search_sales_navigator_leads(url: str) -> Dict[str, Any]:
    """Search for leads using Sales Navigator."""
    params = {"url": url}
    return make_lix_request("li/linkedin/search/sales-navigator/leads", params)


@lix_tool("search_sales_navigator_accounts", "Search for accounts using LinkedIn Sales Navigator search URL.")
def search_sales_navigator_accounts(url: str) -> Dict[str, Any]:
    """Search for accounts using Sales Navigator."""
    params = {"url": url}
    return make_lix_request("li/linkedin/search/sales-navigator/accounts", params)


@lix_tool("search_recruiter_candidates", "Search for candidates using LinkedIn Recruiter search URL.")
def search_recruiter_candidates(url: str) -> Dict[str, Any]:
    """Search for candidates using LinkedIn Recruiter."""
    params = {"url": url}
    return make_lix_request("li/linkedin/search/recruiter/candidates", params)
