"""LangGraph-compatible Lix Account API tools."""

from typing import Dict, Any
from langchain_core.tools import tool
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import make_lix_request


@tool
def get_account_balances() -> Dict[str, Any]:
    """Retrieve the current balance of your Lix account including email credits and Standard Credits.
    
    Returns:
        Dict containing account balance information and credit details
    """
    return make_lix_request("account/balances")


@tool
def get_daily_allowance() -> Dict[str, Any]:
    """Retrieve the daily allowance information for your Lix account.
    
    Returns:
        Dict containing daily allowance limits and usage information
    """
    return make_lix_request("account/daily-allowance")
