"""Base LangGraph-compatible Lix tool interface."""

import requests
from typing import Dict, Any, Optional, Callable
from functools import wraps
from app.core.config import settings

# Constants
BASE_URL = "https://api.lix-it.com/v1"


def lix_tool(name: str, description: str):
    """Decorator to create LangGraph-compatible Lix API tools."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Dict[str, Any]:
            # Call the original function
            return func(*args, **kwargs)
        
        # Add LangGraph tool attributes
        wrapper.__name__ = name
        wrapper.__doc__ = description
        wrapper._langraph_tool_name = name
        wrapper._langraph_tool_description = description
        
        return wrapper
    return decorator


def make_lix_request(endpoint: str, params: Optional[Dict[str, Any]] = None, 
                    method: str = "GET") -> Dict[str, Any]:
    """Make a request to the Lix API."""
    url = f"{BASE_URL}/{endpoint}"
    headers = {
        'Authorization': settings.LIX_API_KEY,
        'Content-Type': 'application/json'
    }
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=params)
        elif method.upper() == "PUT":
            response = requests.put(url, headers=headers, json=params)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.RequestException as e:
        return {"error": str(e), "status_code": getattr(e.response, 'status_code', None)}
