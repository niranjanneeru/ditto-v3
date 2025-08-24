"""LangGraph Tool Registry for LinkedIn/Lix API tools."""

from typing import List, Dict, Any, Callable
import inspect

# Import all LangGraph-compatible tools
from .account_tools import get_account_balances, get_daily_allowance
from .person_tools import enrich_person, enrich_person_extended, get_person_ids
from .company_tools import enrich_organization, get_company_followers, get_organisation_ids
from .search_tools import (
    search_people, search_jobs, search_companies, search_posts,
    search_sales_navigator_leads, search_sales_navigator_accounts,
    search_recruiter_candidates
)
from .post_tools import (
    enrich_post, get_post_comments, get_post_reactions,
    get_user_posts, get_user_comments
)
from .contact_tools import get_email_from_profile, lookup_person_by_email
from .job_tools import enrich_job_posting, get_job_posting_hirers


class LinkedInToolRegistry:
    """Registry for all LangGraph-compatible LinkedIn/Lix API tools."""
    
    def __init__(self):
        """Initialize the tool registry."""
        self._tools = self._register_all_tools()
    
    def _register_all_tools(self) -> Dict[str, Callable]:
        """Register all available tools."""
        tools = {
            # Account tools
            # "get_account_balances": get_account_balances,
            # "get_daily_allowance": get_daily_allowance,
            
            # Person tools
            # "enrich_person": enrich_person,
            # "enrich_person_extended": enrich_person_extended,
            # "get_person_ids": get_person_ids,
            
            # Company tools
            # "enrich_organization": enrich_organization,
            # "get_company_followers": get_company_followers,
            # "get_organisation_ids": get_organisation_ids,
            
            # Search tools
            "search_people": search_people,
            # "search_jobs": search_jobs,
            # "search_companies": search_companies,
            # "search_posts": search_posts,
            # "search_sales_navigator_leads": search_sales_navigator_leads,
            # "search_sales_navigator_accounts": search_sales_navigator_accounts,
            # "search_recruiter_candidates": search_recruiter_candidates,
            
            # Post & Activity tools
            # "enrich_post": enrich_post,
            # "get_post_comments": get_post_comments,
            # "get_post_reactions": get_post_reactions,
            # "get_user_posts": get_user_posts,
            # "get_user_comments": get_user_comments,
            
            # Contact tools
            "get_email_from_profile": get_email_from_profile,
            # "lookup_person_by_email": lookup_person_by_email,
            
            # Job tools
            # "enrich_job_posting": enrich_job_posting,
            # "get_job_posting_hirers": get_job_posting_hirers,
        }
        
        return tools
    
    def get_all_tools(self) -> List[Callable]:
        """Get all registered tools as a list for LangGraph."""
        return list(self._tools.values())
    
    def get_tool_by_name(self, name: str) -> Callable:
        """Get a specific tool by name."""
        if name not in self._tools:
            raise ValueError(f"Tool '{name}' not found. Available tools: {list(self._tools.keys())}")
        return self._tools[name]
    
    def get_tools_by_category(self) -> Dict[str, List[Callable]]:
        """Get tools organized by category."""
        return {
            "Account Management": [
                self._tools["get_account_balances"],
                self._tools["get_daily_allowance"],
            ],
            "Person Enrichment": [
                self._tools["enrich_person"],
                self._tools["enrich_person_extended"],
                self._tools["get_person_ids"],
            ],
            "Company Enrichment": [
                self._tools["enrich_organization"],
                self._tools["get_company_followers"],
                self._tools["get_organisation_ids"],
            ],
            "LinkedIn Search": [
                self._tools["search_people"],
                self._tools["search_jobs"],
                self._tools["search_companies"],
                self._tools["search_posts"],
                self._tools["search_sales_navigator_leads"],
                self._tools["search_sales_navigator_accounts"],
                self._tools["search_recruiter_candidates"],
            ],
            "Post & Activity": [
                self._tools["enrich_post"],
                self._tools["get_post_comments"],
                self._tools["get_post_reactions"],
                self._tools["get_user_posts"],
                self._tools["get_user_comments"],
            ],
            "Contact Information": [
                self._tools["get_email_from_profile"],
                self._tools["lookup_person_by_email"],
            ],
            "Job Information": [
                self._tools["enrich_job_posting"],
                self._tools["get_job_posting_hirers"],
            ],
        }
    
    def get_tool_info(self) -> List[Dict[str, Any]]:
        """Get information about all tools for documentation."""
        tool_info = []
        for name, tool in self._tools.items():
            signature = inspect.signature(tool)
            parameters = []
            for param_name, param in signature.parameters.items():
                if param_name != 'config':  # Skip internal config parameter
                    param_info = {
                        'name': param_name,
                        'type': str(param.annotation) if param.annotation != param.empty else 'Any',
                        'required': param.default == param.empty,
                        'default': param.default if param.default != param.empty else None
                    }
                    parameters.append(param_info)
            
            tool_info.append({
                'name': getattr(tool, '_langraph_tool_name', name),
                'function_name': name,
                'description': getattr(tool, '_langraph_tool_description', tool.__doc__ or 'No description'),
                'parameters': parameters,
            })
        
        return tool_info
    
    def list_tool_names(self) -> List[str]:
        """List all available tool names."""
        return list(self._tools.keys())


# Singleton instance for easy access
linkedin_tools = LinkedInToolRegistry()


def get_linkedin_tools_for_langraph() -> List[Callable]:
    """Get all LinkedIn tools formatted for LangGraph usage."""
    return linkedin_tools.get_all_tools()


def get_linkedin_tools_by_category() -> Dict[str, List[Callable]]:
    """Get LinkedIn tools organized by category."""
    return linkedin_tools.get_tools_by_category()
