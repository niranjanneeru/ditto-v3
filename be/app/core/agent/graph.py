from typing import Annotated, List
from typing_extensions import TypedDict
from textwrap import dedent

from langchain_core.messages import BaseMessage, HumanMessage
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from app.core.graphs.tools.linkedin.tool_registry import get_linkedin_tools_for_langraph
from app.core.config import settings


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
    
    def draft_email_node(state: GraphState) -> GraphState:
        """Draft a personalized email based on prospect information."""
        messages = state["messages"]
        
        # Extract prospect information from conversation
        conversation_context = "\n".join([msg.content for msg in messages if hasattr(msg, 'content') and msg.content])
        
        draft_prompt = dedent(f"""
            Based on the prospect research gathered, draft a personalized cold outreach email.
            
            Guidelines:
            - Keep it concise (under 150 words)
            - Personalize with specific details found about the prospect
            - Clear value proposition
            - Soft call-to-action
            - Professional but conversational tone
            - Subject line included
            
            Context from research:
            {conversation_context[-1000:]}  # Last 1000 chars to avoid token limits
            
            Format your response as:
            Subject: [subject line]
            
            [email body]
        """).strip()
        
        draft_response = llm.invoke([HumanMessage(content=draft_prompt)])
        
        return {"messages": [draft_response]}
    
    def send_email_node(state: GraphState) -> GraphState:
        """Send the drafted email."""
        messages = state["messages"]
        
        # Extract the drafted email from the last message
        last_message = messages[-1]
        email_content = last_message.content if hasattr(last_message, 'content') else ""
        
        # Parse subject and body
        lines = email_content.split('\n')
        subject = lines[0].replace('Subject: ', '') if lines and lines[0].startswith('Subject:') else "Cold Outreach"
        body = '\n'.join(lines[2:]) if len(lines) > 2 else email_content
        
        # Extract recipient email from conversation context
        recipient_email = None
        import re
        for msg in reversed(messages):
            if hasattr(msg, 'content') and msg.content:
                # Simple regex to find email addresses
                email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', msg.content)
                if email_match:
                    recipient_email = email_match.group()
                    break
        
        if not recipient_email:
            error_message = HumanMessage(content="""
            ❌ Cannot send email: No recipient email address found.
            
            Please provide the prospect's email address to send the outreach email.
            """)
            return {"messages": [error_message]}
        
        # Success confirmation (placeholder - integrate with your email service)
        confirmation_message = HumanMessage(content=f"""
        ✅ Email ready to send!
        
        To: {recipient_email}
        Subject: {subject}
        
        The personalized outreach email is ready for delivery.
        Please integrate with your preferred email service to send.
        """)
        
        return {"messages": [confirmation_message]}
    
    def should_continue(state: GraphState):
        messages = state["messages"]
        last_message = messages[-1]
        
        if last_message.tool_calls:
            return "tools"
            
        # Check if user wants to draft an email
        if hasattr(last_message, 'content') and last_message.content:
            content = last_message.content.lower()
            if any(phrase in content for phrase in ['draft email', 'write email', 'create email', 'personalized email']):
                return "draft_email"
                
        return END
    
    def should_send_email(state: GraphState):
        messages = state["messages"]
        
        # Look for user confirmation in recent messages
        for msg in reversed(messages[-3:]):  # Check last 3 messages for confirmation
            if hasattr(msg, 'content') and msg.content:
                content = msg.content.lower()
                if any(phrase in content for phrase in ['yes', 'send it', 'send email', 'confirm', 'go ahead']):
                    return "send_email"
                elif any(phrase in content for phrase in ['no', 'don\'t send', 'cancel', 'revise']):
                    return "agent"  # Go back to agent for revisions
        
        return END  # Default to end if no clear intent
    
    tool_node = ToolNode(linkedin_tools)
    
    workflow = StateGraph(GraphState)
    
    # Add all nodes
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", tool_node)
    workflow.add_node("draft_email", draft_email_node)
    workflow.add_node("send_email", send_email_node)
    
    workflow.set_entry_point("agent")
    
    # Agent routing
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "draft_email": "draft_email",
            END: END,
        }
    )
    
    # Tools always go back to agent
    workflow.add_edge("tools", "agent")
    
    # Email draft routing (wait for user confirmation)
    workflow.add_conditional_edges(
        "draft_email",
        should_send_email,
        {
            "send_email": "send_email",
            "agent": "agent",
            END: END,
        }
    )
    
    # After sending email, end workflow
    workflow.add_edge("send_email", END)
    
    compiled_graph = workflow.compile()
    
    return compiled_graph


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
