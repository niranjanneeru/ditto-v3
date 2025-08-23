"""LangGraph-compatible LinkedIn Post and Activity tools."""

from typing import Dict, Any, Optional
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import lix_tool, make_lix_request


@lix_tool("enrich_post", "Enrich LinkedIn post data from post URL.")
def enrich_post(post_url: str) -> Dict[str, Any]:
    """Enrich LinkedIn post data."""
    params = {"post_url": post_url}
    return make_lix_request("post", params)


@lix_tool("get_post_comments", "Retrieve comments for a LinkedIn post.")
def get_post_comments(post_url: str) -> Dict[str, Any]:
    """Get comments for a LinkedIn post."""
    params = {"post_url": post_url}
    return make_lix_request("post/comments", params)


@lix_tool("get_post_reactions", "Retrieve reactions for a LinkedIn post.")
def get_post_reactions(post_url: str, reaction_type: Optional[str] = None) -> Dict[str, Any]:
    """Get reactions for a LinkedIn post."""
    params = {"post_url": post_url}
    if reaction_type:
        params["reaction_type"] = reaction_type
    return make_lix_request("post/reactions", params)


@lix_tool("get_user_posts", "Get the full activity posts of a LinkedIn user.")
def get_user_posts(profile_url: str, start: Optional[int] = None, count: Optional[int] = None) -> Dict[str, Any]:
    """Get posts from LinkedIn user activity."""
    params = {"profile_url": profile_url}
    if start is not None:
        params["start"] = start
    if count is not None:
        params["count"] = count
    return make_lix_request("activity/posts", params)


@lix_tool("get_user_comments", "Get the comments activity of a LinkedIn user.")
def get_user_comments(profile_url: str, start: Optional[int] = None, count: Optional[int] = None) -> Dict[str, Any]:
    """Get comments from LinkedIn user activity."""
    params = {"profile_url": profile_url}
    if start is not None:
        params["start"] = start
    if count is not None:
        params["count"] = count
    return make_lix_request("activity/comments", params)
