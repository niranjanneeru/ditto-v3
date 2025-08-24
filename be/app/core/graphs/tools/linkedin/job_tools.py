"""LangGraph-compatible LinkedIn Job tools."""

from typing import Dict, Any
from langchain_core.tools import tool
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import make_lix_request


@tool
def enrich_job_posting(job_url: str) -> Dict[str, Any]:
    """Enrich job posting data from LinkedIn job URL.
    
    Args:
        job_url: LinkedIn job URL to get detailed job information
        
    Returns:
        Dict containing enriched job posting data
    """
    if not job_url:
        return {"error": "Job URL is required"}
    
    params = {"job_url": job_url}
    return make_lix_request("job-posting", params)


@tool
def get_job_posting_hirers(job_url: str) -> Dict[str, Any]:
    """Get hirers information for a specific job posting.
    
    Args:
        job_url: LinkedIn job URL to get hiring manager information
        
    Returns:
        Dict containing hirers/recruiters for the job posting
    """
    if not job_url:
        return {"error": "Job URL is required"}
    
    params = {"job_url": job_url}
    return make_lix_request("li/linkedin/search/job-posting-hirers", params)
