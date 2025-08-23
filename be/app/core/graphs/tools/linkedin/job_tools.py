"""LangGraph-compatible LinkedIn Job tools."""

from typing import Dict, Any
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import lix_tool, make_lix_request


@lix_tool("enrich_job_posting", "Enrich job posting data from LinkedIn job URL.")
def enrich_job_posting(job_url: str) -> Dict[str, Any]:
    """Enrich job posting data from LinkedIn."""
    params = {"job_url": job_url}
    return make_lix_request("job-posting", params)


@lix_tool("get_job_posting_hirers", "Get hirers information for a specific job posting.")
def get_job_posting_hirers(job_url: str) -> Dict[str, Any]:
    """Get hirers for a job posting."""
    params = {"job_url": job_url}
    return make_lix_request("li/linkedin/search/job-posting-hirers", params)
