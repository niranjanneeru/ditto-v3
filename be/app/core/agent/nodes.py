"""
Node functions for the LangGraph cold outreach workflow.
"""

import logging
from textwrap import dedent
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from app.core.config import settings
from app.core.graphs.tools.siren import siren_client
from .state import GraphState
from .utils import send_sim_event

logger = logging.getLogger(__name__)

# Initialize LLM for nodes
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.1,
    api_key=settings.OPENAI_API_KEY
)


def agent_node(state: GraphState) -> GraphState:
    """Agent node that processes user queries and tool results."""
    logger.info("🤖 AGENT NODE: Starting agent processing")
    messages = state["messages"]
    logger.info(f"📝 AGENT NODE: Processing {len(messages)} messages")
    
    # System prompt for cold outreach
    system_prompt = dedent("""
        You are an AI agent specialized in helping with cold outreach and lead generation.
        
        Your role is to:
        - Help users find and research prospects using LinkedIn data
        - Provide personalized outreach advice and strategies
        - Analyze prospect information for effective messaging
        - Suggest conversation starters and follow-up approaches
        - If you already have the email to send dont use tools to find it again
        
        You have access to LinkedIn tools for:
        - Searching for people and companies
        - Getting detailed profile information
        - Finding contact information
        - Finding email if you have linkedin profile url

        You have access to Siren Tools to send email
        
        When users ask for prospect research or contact information, use the appropriate LinkedIn tools.
        For general advice, respond directly with helpful outreach strategies.
        
        Keep responses conversational and actionable, suitable for voice interactions.
    """).strip()
    
    # Add system prompt if this is the start of conversation
    system_message = HumanMessage(content=system_prompt)
    messages_with_system = [system_message] + messages
    
    # Call LLM (it will decide whether to use tools or respond directly)
    logger.info("🧠 AGENT NODE: Calling LLM with tools")
    
    # Get LinkedIn tools and bind them to LLM
    from app.core.graphs.tools.linkedin.tool_registry import get_linkedin_tools_for_langraph
    linkedin_tools = get_linkedin_tools_for_langraph()
    llm_with_tools = llm.bind_tools(linkedin_tools)
    
    response = llm_with_tools.invoke(messages_with_system)
    
    # Log LLM decision
    if hasattr(response, 'tool_calls') and response.tool_calls:
        logger.info(f"🔧 AGENT NODE: LLM decided to call {len(response.tool_calls)} tools: {[tc.get('name', 'unknown') for tc in response.tool_calls]}")
    else:
        logger.info("💬 AGENT NODE: LLM decided to respond directly (no tools)")
    
    logger.info("✅ AGENT NODE: Completed successfully")
    return {"messages": [response]}


async def output_node(state: GraphState) -> GraphState:
    """Output node that publishes SIM events and handles workflow completion."""
    message = state["messages"][-1]
    logger.info(f"📤 OUTPUT NODE: Publishing final result: {message.content[:100]}...")
    
    # Extract room from context if available
    # This would be passed through the workflow context in practice
    room = getattr(state, '_room_context', None)
    
    if room:
        await send_sim_event(room, {
            "type": "workflow_complete",
            "message": message.content,
            "phase": "completion"
        })
    
    return {"messages": [message]}


def draft_email_node(state: GraphState) -> GraphState:
    """Draft a personalized email based on prospect information."""
    logger.info("📧 DRAFT EMAIL NODE: Starting email drafting")
    messages = state["messages"]
    
    # Get conversation context for email drafting
    conversation_context = "\n".join([
        f"{type(msg).__name__}: {getattr(msg, 'content', str(msg))}" 
        for msg in messages[-5:]  # Last 5 messages for context
    ])
    
    email_draft_prompt = dedent(f"""
        Based on the following conversation, draft a personalized cold outreach email.
        
        Conversation Context:
        {conversation_context}
        
        Create a compelling email that:
        1. Has a personalized subject line
        2. References relevant information from the prospect research
        3. Provides clear value proposition
        4. Includes a specific call-to-action
        5. Is concise and professional
        
        Format your response as:
        SUBJECT: [subject line]
        
        EMAIL:
        [email body]
        
        RECIPIENT: [if mentioned in conversation]
    """).strip()
    
    logger.info("🧠 DRAFT EMAIL NODE: Calling LLM for email generation")
    email_response = llm.invoke([HumanMessage(content=email_draft_prompt)])
    
    # Create a message that presents the draft for approval
    draft_message = f"""Here's the drafted email for your review:

{email_response.content}

Would you like me to send this email? Please confirm by saying "yes" or "send it", or ask for revisions."""
    
    logger.info("✅ DRAFT EMAIL NODE: Email draft completed")
    return {"messages": [AIMessage(content=draft_message)]}


def confirm_email_node(state: GraphState) -> GraphState:
    """Human-in-the-loop confirmation node - pauses workflow for user approval."""
    logger.info("⏸️ CONFIRM EMAIL NODE: Pausing for human approval")
    messages = state["messages"]
    
    # Find the last drafted email
    draft_content = None
    for msg in reversed(messages):
        if hasattr(msg, 'content') and 'SUBJECT:' in msg.content:
            draft_content = msg.content
            break
    
    if draft_content:
        confirmation_message = f"""📧 **Email Ready for Review**

{draft_content}

**Please confirm:**
- Say "yes" or "send it" to proceed with sending
- Say "no" or "cancel" to stop
- Ask for changes if you'd like revisions

What would you like to do?"""
    else:
        confirmation_message = "I need to draft an email first. Please provide prospect information and your requirements."
    
    logger.info("✅ CONFIRM EMAIL NODE: Awaiting user confirmation")
    return {"messages": [AIMessage(content=confirmation_message)]}


def send_email_node(state: GraphState) -> GraphState:
    """Send the drafted email using LLM extraction."""
    logger.info("📤 SEND EMAIL NODE: Starting email transmission")
    messages = state["messages"]
    
    # Get conversation history for email extraction
    conversation_history = "\n".join([
        f"{type(msg).__name__}: {getattr(msg, 'content', str(msg))}" 
        for msg in messages
    ])
    
    # Use LLM to extract email components from conversation
    extraction_prompt = dedent(f"""
        From the following conversation history, extract the email details:
        
        {conversation_history}
        
        Extract and return ONLY:
        1. RECIPIENT_EMAIL: [email address to send to]
        2. SUBJECT: [email subject line]
        3. BODY: [email body content]
        
        If any information is missing, respond with ERROR: [what's missing]
        
        Format your response exactly like this:
        RECIPIENT_EMAIL: example@email.com
        SUBJECT: Your subject here
        BODY: Your email body here
    """).strip()
    
    logger.info("🧠 SEND EMAIL NODE: Extracting email components with LLM")
    extraction_response = llm.invoke([HumanMessage(content=extraction_prompt)])
    extraction_text = extraction_response.content
    
    # Parse the extracted information
    try:
        lines = extraction_text.strip().split('\n')
        recipient = None
        subject = None
        body = None
        
        for line in lines:
            if line.startswith('RECIPIENT_EMAIL:'):
                recipient = line.split(':', 1)[1].strip()
            elif line.startswith('SUBJECT:'):
                subject = line.split(':', 1)[1].strip()
            elif line.startswith('BODY:'):
                body = line.split(':', 1)[1].strip()
        
        if not recipient or not subject or not body:
            error_msg = "❌ Could not extract complete email information. Please provide recipient email, subject, and body."
            logger.error(f"SEND EMAIL NODE: {error_msg}")
            return {"messages": [AIMessage(content=error_msg)]}
        
        logger.info(f"📋 SEND EMAIL NODE: Extracted - Recipient: {recipient}, Subject: {subject[:50]}...")
        
        # Send email using Siren client
        try:
            logger.info("📡 SEND EMAIL NODE: Calling Siren API")
            siren_client.call_tool({
                "recipient_value": recipient,
                "channel": "EMAIL",
                "subject": subject,
                "body": body
            })
            
            success_message = f"✅ Email sent successfully to {recipient}!\n\nSubject: {subject}\n\nThe email has been delivered via Siren API."
            logger.info("✅ SEND EMAIL NODE: Email sent successfully")
            return {"messages": [AIMessage(content=success_message)]}
            
        except Exception as e:
            error_message = f"❌ Failed to send email: {str(e)}"
            logger.error(f"SEND EMAIL NODE: Siren API error: {str(e)}")
            return {"messages": [AIMessage(content=error_message)]}
            
    except Exception as e:
        error_message = f"❌ Failed to parse email information: {str(e)}"
        logger.error(f"SEND EMAIL NODE: Parsing error: {str(e)}")
        return {"messages": [AIMessage(content=error_message)]}
