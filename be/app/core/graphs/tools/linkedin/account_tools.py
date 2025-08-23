"""LangGraph-compatible Lix Account API tools."""

from typing import Dict, Any
from app.core.graphs.tools.linkedin.base_langraph_lix_tool import lix_tool, make_lix_request


@lix_tool("lix_account_balances", "Retrieve the current balance of your Lix account including email credits and Standard Credits.")
def get_account_balances() -> Dict[str, Any]:
    """Get current account balance."""
    return make_lix_request("account/balances")


@lix_tool("lix_account_daily_allowance", "Retrieve the daily allowance information for your Lix account.")
def get_daily_allowance() -> Dict[str, Any]:
    """Get daily allowance information."""
    return make_lix_request("account/daily-allowance")
