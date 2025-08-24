"""LangGraph-compatible LinkedIn Contact Information tools."""

from typing import Dict, Any, Optional
from langchain_core.tools import tool
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import make_lix_request


@tool
def get_email_from_profile(url: str) -> Dict[str, Any]:
    """Retrieve a validated email address for any LinkedIn user.
    
    Args:
        url: LinkedIn profile URL to get email address for
        
    Returns:
        Dict containing validated email address information
    """
    if not url:
        return {"error": "LinkedIn URL is required"}
    
    params = {"url": url}
    return make_lix_request("contact/email/by-linkedin", params)


@tool
def lookup_person_by_email(email: str, webhook_url: Optional[str] = None) -> Dict[str, Any]:
    """Lookup person by email address with optional webhook notifications.
    
    Args:
        email: Email address to lookup person information for
        webhook_url: Optional webhook URL for async notifications
        
    Returns:
        Dict containing person information found by email
    """
    if not email:
        return {"error": "Email address is required"}
    
    params = {"email": email}
    if webhook_url:
        params["webhook_url"] = webhook_url
    return make_lix_request("lookc/person/by-email", params)
