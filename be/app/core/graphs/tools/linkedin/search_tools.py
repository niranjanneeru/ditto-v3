"""LangGraph-compatible LinkedIn Search tools."""

from typing import Dict, Any
from urllib.parse import quote_plus
from langchain_core.tools import tool
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import make_lix_request


@tool
def search_people(query: str) -> Dict[str, Any]:
    """Search for people on LinkedIn using keywords or search terms.
    
    Args:
        query: Search keywords or terms to find people on LinkedIn
        
    Returns:
        Dict containing search results with people profiles
    """
    if not query:
        return {"error": "Query parameter is required"}
    
    params = {"url": f"https://www.linkedin.com/search/results/people/?keywords={quote_plus(query)}&origin=SWITCH_SEARCH_VERTICAL&sid=%40%2Co"}
    response = make_lix_request("li/linkedin/search/people", params)
    print('search_people', response)
    return response


@tool
def search_jobs(query: str) -> Dict[str, Any]:
    """Search for jobs on LinkedIn using keywords or job titles.
    
    Args:
        query: Job search keywords, titles, or company names
        
    Returns:
        Dict containing job search results
    """
    if not query:
        return {"error": "Query parameter is required"}
    
    params = {"keywords": query}
    return make_lix_request("li/linkedin/search/jobs", params)


@tool
def search_companies(query: str) -> Dict[str, Any]:
    """Search for companies on LinkedIn using company names or keywords.
    
    Args:
        query: Company name or industry keywords to search for
        
    Returns:
        Dict containing company search results and information
    """
    if not query:
        return {"error": "Query parameter is required"}
    
    params = {"keywords": query}
    return make_lix_request("li/linkedin/search/companies", params)


@tool
def search_posts(query: str) -> Dict[str, Any]:
    """Search for posts on LinkedIn using keywords or search terms.
    
    Args:
        query: Keywords or search terms to find LinkedIn posts
        
    Returns:
        Dict containing post search results
    """
    if not query:
        return {"error": "Query parameter is required"}
    
    params = {"keywords": query}
    return make_lix_request("li/linkedin/search/posts", params)


@tool
def search_sales_navigator_leads(url: str) -> Dict[str, Any]:
    """Search for leads using LinkedIn Sales Navigator search URL.
    
    Args:
        url: Sales Navigator search URL for leads
        
    Returns:
        Dict containing lead search results from Sales Navigator
    """
    params = {"url": url}
    return make_lix_request("li/linkedin/search/sales-navigator/leads", params)


@tool
def search_sales_navigator_accounts(url: str) -> Dict[str, Any]:
    """Search for accounts using LinkedIn Sales Navigator search URL.
    
    Args:
        url: Sales Navigator search URL for accounts
        
    Returns:
        Dict containing account search results from Sales Navigator
    """
    params = {"url": url}
    return make_lix_request("li/linkedin/search/sales-navigator/accounts", params)


@tool
def search_recruiter_candidates(url: str) -> Dict[str, Any]:
    """Search for candidates using LinkedIn Recruiter search URL.
    
    Args:
        url: LinkedIn Recruiter search URL for candidates
        
    Returns:
        Dict containing candidate search results from Recruiter
    """
    params = {"url": url}
    return make_lix_request("li/linkedin/search/recruiter/candidates", params)
