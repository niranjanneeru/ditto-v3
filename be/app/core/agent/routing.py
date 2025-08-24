"""
Routing functions for the LangGraph cold outreach workflow.
"""

import logging
from textwrap import dedent
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END
from app.core.config import settings
from .state import GraphState

logger = logging.getLogger(__name__)

# Initialize LLM for intent detection
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.1,
    api_key=settings.OPENAI_API_KEY
)


def should_continue(state: GraphState):
    """Determine next step in workflow based on LLM intent detection."""
    logger.info("🔀 ROUTING: Determining next step from agent")
    messages = state["messages"]
    last_message = messages[-1]
    
    if last_message.tool_calls:
        logger.info(f"🔧 ROUTING: Going to tools (found {len(last_message.tool_calls)} tool calls)")
        return "tools"
    
    # Use LLM to understand user intent from conversation context
    if hasattr(last_message, 'content') and last_message.content:
        # Get recent conversation for context (last 3 messages)
        recent_messages = messages[-3:] if len(messages) >= 3 else messages
        conversation_context = "\n".join([
            f"{type(msg).__name__}: {getattr(msg, 'content', str(msg))}" 
            for msg in recent_messages
        ])
        
        intent_prompt = dedent(f"""
            Analyze the following conversation to determine the user's EXACT intent.
            
            Conversation:
            {conversation_context}
            
            IMPORTANT: Be very specific in your analysis.
            
            User Intent Analysis:
            1. If user explicitly asks to DRAFT/WRITE/COMPOSE an email → "draft_email"
            2. If user asks to SEARCH/FIND/LOOKUP people, companies, or information → "tools"  
            3. If user asks questions about prospects, LinkedIn data, or research → "tools"
            4. In ALL OTHER cases (greetings, thanks, unclear requests, etc.) → "end"
            5. If user asks to send an email → "send_email"
            6. If user specify an email id and ask to draft procced with "draft_email" don't use "tools"
            7. If user specify an email id and ask to send email procced with "send_email" don't use "tools"
            
            Respond with EXACTLY ONE word:
            - "draft_email" - only if explicitly requesting email creation
            - "tools" - only if requesting search/research/LinkedIn data  
            - "send_email" - only if explicitly requesting to send an email with details
            - "end" - for everything else (greetings, unclear, thanks, etc.)
            
            Be conservative: when in doubt, use "end".
        """).strip()
        
        logger.info("🧠 ROUTING: Calling LLM for intent detection")
        intent_response = llm.invoke([HumanMessage(content=intent_prompt)])
        intent = intent_response.content.strip().lower()
        
        logger.info(f"🎯 ROUTING: LLM detected intent: '{intent}'")
        
        if "draft_email" in intent:
            logger.info("📧 ROUTING: Going to draft_email (LLM detected email intent)")
            return "draft_email"
        elif "send_email" in intent:
            logger.info("📤 ROUTING: Going to send_email (LLM detected send email intent)")
            return "send_email"
        elif "tools" in intent:
            logger.info("🔧 ROUTING: Going to tools (LLM detected search/research intent)")
            return "tools"
        else:
            logger.info("🛑 ROUTING: Ending workflow (LLM suggests end or unclear intent)")
            return END
    
    logger.info("🛑 ROUTING: Ending workflow (no content to analyze)")
    return END


def should_send_email(state: GraphState):
    """Determine if email should be sent based on user confirmation."""
    logger.info("📧 EMAIL ROUTING: Checking for email send confirmation")
    messages = state["messages"]
    
    if not messages:
        logger.info("🛑 EMAIL ROUTING: No messages - ending workflow")
        return END
    
    # Look for confirmation in recent messages
    for msg in messages[-3:]:  # Check last 3 messages
        if hasattr(msg, 'content') and msg.content:
            content = msg.content.lower()
            if any(phrase in content for phrase in ['yes', 'send it', 'send email', 'confirm', 'go ahead']):
                logger.info("✅ EMAIL ROUTING: User confirmed - going to send_email")
                return "send_email"
            elif any(phrase in content for phrase in ['no', 'don\'t send', 'cancel', 'revise']):
                logger.info("❌ EMAIL ROUTING: User declined - ending workflow")
                return END  # End workflow instead of recursion
    
    logger.info("🛑 EMAIL ROUTING: No clear intent - ending workflow")
    return END  # Default to end if no clear intent
