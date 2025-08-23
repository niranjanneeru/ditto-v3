"""LangGraph-compatible LinkedIn Contact Information tools."""

from typing import Dict, Any
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import lix_tool, make_lix_request


@lix_tool("get_email_from_profile", "Retrieve a validated email address for any LinkedIn user.")
def get_email_from_profile(url: str) -> Dict[str, Any]:
    """Get validated email address from LinkedIn profile."""
    params = {"url": url}
    return make_lix_request("contact/email/by-linkedin", params)


@lix_tool("lookup_person_by_email", "Lookup person by email address. Supports asynchronous requests with webhook notifications.")
def lookup_person_by_email(email: str, webhook_url: str = None) -> Dict[str, Any]:
    """Lookup person by email address."""
    params = {"email": email}
    if webhook_url:
        params["webhook_url"] = webhook_url
    return make_lix_request("lookc/person/by-email", params)
