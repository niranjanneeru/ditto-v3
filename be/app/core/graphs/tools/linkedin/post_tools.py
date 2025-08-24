"""LangGraph-compatible LinkedIn Post and Activity tools."""

from typing import Dict, Any, Optional
from langchain_core.tools import tool
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import make_lix_request


@tool
def enrich_post(post_url: str) -> Dict[str, Any]:
    """Enrich LinkedIn post data from post URL.
    
    Args:
        post_url: LinkedIn post URL to get detailed post information
        
    Returns:
        Dict containing enriched LinkedIn post data
    """
    if not post_url:
        return {"error": "Post URL is required"}
    
    params = {"post_url": post_url}
    return make_lix_request("post", params)


@tool
def get_post_comments(post_url: str) -> Dict[str, Any]:
    """Retrieve comments for a LinkedIn post.
    
    Args:
        post_url: LinkedIn post URL to get comments for
        
    Returns:
        Dict containing post comments and engagement data
    """
    if not post_url:
        return {"error": "Post URL is required"}
    
    params = {"post_url": post_url}
    return make_lix_request("post/comments", params)


@tool
def get_post_reactions(post_url: str, reaction_type: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve reactions for a LinkedIn post.
    
    Args:
        post_url: LinkedIn post URL to get reactions for
        reaction_type: Optional specific reaction type to filter by
        
    Returns:
        Dict containing post reactions and engagement metrics
    """
    if not post_url:
        return {"error": "Post URL is required"}
    
    params = {"post_url": post_url}
    if reaction_type:
        params["reaction_type"] = reaction_type
    return make_lix_request("post/reactions", params)


@tool
def get_user_posts(profile_url: str, start: Optional[int] = None, count: Optional[int] = None) -> Dict[str, Any]:
    """Get the full activity posts of a LinkedIn user.
    
    Args:
        profile_url: LinkedIn profile URL to get posts for
        start: Optional starting position for pagination
        count: Optional number of posts to retrieve
        
    Returns:
        Dict containing user's LinkedIn posts and activity
    """
    if not profile_url:
        return {"error": "Profile URL is required"}
    
    params = {"profile_url": profile_url}
    if start is not None:
        params["start"] = start
    if count is not None:
        params["count"] = count
    return make_lix_request("activity/posts", params)


@tool
def get_user_comments(profile_url: str, start: Optional[int] = None, count: Optional[int] = None) -> Dict[str, Any]:
    """Get the comments activity of a LinkedIn user.
    
    Args:
        profile_url: LinkedIn profile URL to get comments for
        start: Optional starting position for pagination
        count: Optional number of comments to retrieve
        
    Returns:
        Dict containing user's LinkedIn comments and activity
    """
    if not profile_url:
        return {"error": "Profile URL is required"}
    
    params = {"profile_url": profile_url}
    if start is not None:
        params["start"] = start
    if count is not None:
        params["count"] = count
    return make_lix_request("activity/comments", params)
