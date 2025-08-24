from typing import Annotated, List
from typing_extensions import TypedDict
from textwrap import dedent

from langchain_core.messages import BaseMessage, HumanMessage
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from app.core.config import settings
from app.core.graphs.tools.linkedin.tool_registry import get_linkedin_tools_for_langraph


class GraphState(TypedDict):
    """State for the LangGraph workflow."""
    messages: Annotated[List[BaseMessage], add_messages]


def create_cold_outreach_graph():
    """
    Create a standard LangGraph workflow for cold outreach assistance.
    
    Returns:
        Compiled LangGraph for cold outreach assistance
    """
    # System prompt for cold outreach
    system_prompt = dedent("""
        You are an AI agent specialized in helping with cold outreach and lead generation.
        
        Your role is to:
        - Help users find and research prospects using LinkedIn data
        - Provide personalized outreach advice and strategies
        - Analyze prospect information for effective messaging
        - Suggest conversation starters and follow-up approaches
        
        You have access to LinkedIn tools for:
        - Searching for people and companies
        - Getting detailed profile information
        - Finding contact information
        - Analyzing posts and activities
        - Finding email if you have linkedin profile url
        
        When users ask for prospect research or contact information, use the appropriate LinkedIn tools.
        For general advice, respond directly with helpful outreach strategies.
        
        Keep responses conversational and actionable, suitable for voice interactions.
    """).strip()
    
    # Initialize the LLM
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.1,
        api_key=settings.OPENAI_API_KEY
    )
    
    # Get LinkedIn tools and bind them to LLM
    linkedin_tools = get_linkedin_tools_for_langraph()
    llm_with_tools = llm.bind_tools(linkedin_tools)
    
    def agent_node(state: GraphState) -> GraphState:
        """Agent node that processes user queries and tool results."""
        messages = state["messages"]
        
        # Add system prompt if this is the start of conversation
        system_message = HumanMessage(content=system_prompt)
        messages_with_system = [system_message] + messages
        
        # Call LLM (it will decide whether to use tools or respond directly)
        response = llm_with_tools.invoke(messages_with_system)
        
        return {"messages": [response]}
    
    def should_continue(state: GraphState):
        """Determine if we should call tools or end."""
        messages = state["messages"]
        last_message = messages[-1]
        
        # If LLM made tool calls, go to tools
        if last_message.tool_calls:
            return "tools"
        # Otherwise end
        return END
    
    # Create tool node
    tool_node = ToolNode(linkedin_tools)
    
    # Build graph
    workflow = StateGraph(GraphState)
    
    # Add nodes
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", tool_node)
    
    # Set entry point
    workflow.set_entry_point("agent")
    
    # Add conditional edges
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            END: END,
        }
    )
    
    # Add edge from tools back to agent
    workflow.add_edge("tools", "agent")
    
    # Compile
    return workflow.compile()


def create_graph():
    """
    Factory function to create the LangGraph workflow.
    
    Returns:
        Compiled LangGraph for cold outreach assistance with tool calling
    """
    return create_cold_outreach_graph()


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
