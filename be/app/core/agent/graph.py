"""
Main LangGraph workflow creation and management for cold outreach assistance.

This module orchestrates the modular components to create a complete workflow.
"""

import logging
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableLambda
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.core.graphs.tools.linkedin.tool_registry import get_linkedin_tools_for_langraph
from .state import GraphState
from .nodes import agent_node, output_node, draft_email_node, confirm_email_node, send_email_node
from .routing import should_continue

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_cold_outreach_graph(room):
    """
    Create a standard LangGraph workflow for cold outreach assistance.
    
    Returns:
        Compiled LangGraph for cold outreach assistance
    """
    logger.info("🏗️ GRAPH: Creating cold outreach workflow")
    
    # Get LinkedIn tools for the workflow
    linkedin_tools = get_linkedin_tools_for_langraph()
    tool_node = ToolNode(linkedin_tools)
    
    # Create the workflow graph
    workflow = StateGraph(GraphState)
    
    # Add all nodes
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", tool_node)
    workflow.add_node("draft_email", draft_email_node)
    workflow.add_node("confirm_email", confirm_email_node)
    workflow.add_node("send_email", send_email_node)
    workflow.add_node("output", output_node)
    
    # Set entry point
    workflow.set_entry_point("agent")
    
    # Agent routing - determines next step based on intent
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "draft_email": "draft_email",
            "send_email": "send_email",
            END: "output",
        }
    )
    
    # Tools always go back to agent for processing
    workflow.add_edge("tools", "agent")
    
    # After drafting email, always go to confirmation node (human interrupt)
    workflow.add_edge("draft_email", "confirm_email")
    
    # Human confirmation routing (wait for user approval)
    workflow.add_edge("confirm_email", "output")
    
    # After sending email, go to output
    workflow.add_edge("send_email", "output")
    
    # Final output node to end workflow
    workflow.add_edge("output", END)
    
    # Compile with recursion limit to prevent infinite loops
    compiled_graph = workflow.compile()
    
    # Set default config with recursion limit
    def invoke_with_config(input_data, config=None):
        if config is None:
            config = {}
        # Set recursion limit to prevent infinite loops
        config.setdefault("recursion_limit", 10)
        return compiled_graph.invoke(input_data, config=config)
    
    # Replace invoke method with recursion-limited version
    compiled_graph.invoke = invoke_with_config
    
    logger.info("✅ GRAPH: Cold outreach workflow created successfully")
    return compiled_graph


def create_graph(room):
    """
    Factory function to create the LangGraph workflow.
    
    Returns:
        Compiled LangGraph for cold outreach assistance with tool calling
    """
    return create_cold_outreach_graph(room)


# Create a runnable that can be used with LangChain adapters
def create_runnable_graph():
    """
    Create a RunnableLambda that wraps the LangGraph for compatibility.
    
    Returns:
        RunnableLambda that can be used with LLMAdapter
    """
    graph = create_graph()
    
    def run_graph(input_data):
        """Run the graph with input data."""
        try:
            if isinstance(input_data, str):
                # Simple string input
                messages = [HumanMessage(content=input_data)]
            elif hasattr(input_data, 'messages'):
                # Chat context input
                messages = input_data.messages
            else:
                # Fallback
                messages = [HumanMessage(content=str(input_data))]
            
            # Run the graph
            result = graph.invoke({"messages": messages})
            
            # Return the last message
            if result.get("messages"):
                return result["messages"][-1].content
            else:
                return "I'm here to help with your cold outreach needs."
                
        except Exception as e:
            print(f"Error in runnable graph: {e}")
            return "I'm sorry, I encountered an error. How can I help with your cold outreach campaign?"
    
    return RunnableLambda(run_graph)
