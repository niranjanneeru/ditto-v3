from typing import Annotated, List
from typing_extensions import TypedDict
from textwrap import dedent
import logging
import json

from langchain_core.messages import BaseMessage, HumanMessage
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from app.core.graphs.tools.linkedin.tool_registry import get_linkedin_tools_for_langraph
from app.core.graphs.tools.siren import siren_client
from app.core.config import settings


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def send_sim_event(room, payload: dict, topic: str = "sim:event", identities: list[str] | None = None, reliable: bool = True):
    data = json.dumps(payload)
    await room.local_participant.publish_data(
        data,
        reliable=reliable,
        destination_identities=identities or [],
        topic=topic
    )


class GraphState(TypedDict):
    """State for the LangGraph workflow."""
    messages: Annotated[List[BaseMessage], add_messages]


def create_cold_outreach_graph(room):
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
        logger.info("🤖 AGENT NODE: Starting agent processing")
        messages = state["messages"]
        logger.info(f"📝 AGENT NODE: Processing {len(messages)} messages")
        
        # Add system prompt if this is the start of conversation
        system_message = HumanMessage(content=system_prompt)
        messages_with_system = [system_message] + messages
        
        # Call LLM (it will decide whether to use tools or respond directly)
        logger.info("🧠 AGENT NODE: Calling LLM with tools")
        response = llm_with_tools.invoke(messages_with_system)
        
        # Log LLM decision
        if hasattr(response, 'tool_calls') and response.tool_calls:
            logger.info(f"🔧 AGENT NODE: LLM decided to call {len(response.tool_calls)} tools: {[tc.get('name', 'unknown') for tc in response.tool_calls]}")
        else:
            logger.info("💬 AGENT NODE: LLM decided to respond directly (no tools)")
        
        logger.info("✅ AGENT NODE: Completed successfully")
        return {"messages": [response]}

    async def output_node(state: GraphState) -> GraphState:
        message = state["messages"][-1]
        await send_sim_event(
            room,
            {"type": "SIM_EVENT", "phase": "Complete", "room": room.name, "message": message.content if hasattr(message, 'content') else message},
            topic="sim:event",
            identities=None,
            reliable=True,
        )
    
    def draft_email_node(state: GraphState) -> GraphState:
        """Draft a personalized email based on prospect information."""
        logger.info("📧 DRAFT EMAIL NODE: Starting email drafting")
        messages = state["messages"]
        logger.info(f"📝 DRAFT EMAIL NODE: Analyzing {len(messages)} messages for context")
        
        # Extract prospect information from conversation
        conversation_context = "\n".join([msg.content for msg in messages if hasattr(msg, 'content') and msg.content])
        logger.info(f"📊 DRAFT EMAIL NODE: Extracted {len(conversation_context)} chars of context")
        
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
        
        logger.info("🧠 DRAFT EMAIL NODE: Calling LLM to draft email")
        draft_response = llm.invoke([HumanMessage(content=draft_prompt)])
        logger.info("✅ DRAFT EMAIL NODE: Email draft completed successfully")
        
        return {"messages": [draft_response]}
    
    def confirm_email_node(state: GraphState) -> GraphState:
        """Human-in-the-loop confirmation node - pauses workflow for user approval."""
        logger.info("⏸️ CONFIRM EMAIL NODE: Waiting for human approval")
        messages = state["messages"]
        
        # Get the drafted email from the last message
        last_message = messages[-1]
        email_content = last_message.content if hasattr(last_message, 'content') else ""
        
        # Extract recipient email from conversation
        recipient_email = "Unknown recipient"
        import re
        for msg in reversed(messages):
            if hasattr(msg, 'content') and msg.content:
                email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', msg.content)
                if email_match:
                    recipient_email = email_match.group()
                    break
        
        # Create confirmation prompt
        confirmation_message = HumanMessage(content=dedent(f"""
            📧 **EMAIL READY FOR SENDING**
            
            **To:** {recipient_email}
            
            **Email Content:**
            {email_content}
            
            ---
            
            🤔 **Do you want to send this email?**
            
            Say "**yes**" or "**send it**" to proceed with sending.
            Say "**no**" or "**cancel**" to abort.
            
            ⏸️ **Workflow paused - waiting for your confirmation...**
        """).strip())
        
        logger.info(f"⏸️ CONFIRM EMAIL NODE: Showing email preview to user (To: {recipient_email})")
        return {"messages": [confirmation_message]}
    
    async def send_email_node(state: GraphState) -> GraphState:
        """Send the drafted email using LLM extraction."""
        logger.info("📤 SEND EMAIL NODE: Starting email sending process")
        messages = state["messages"]
        logger.info(f"📝 SEND EMAIL NODE: Processing {len(messages)} messages")
        
        # Build conversation context for LLM analysis
        conversation_context = "\n".join([
            f"{type(msg).__name__}: {getattr(msg, 'content', str(msg))}" 
            for msg in messages[-10:]  # Last 10 messages for context
        ])
        
        # Use LLM to extract email components from chat history
        extraction_prompt = dedent(f"""
            Analyze the following conversation to extract email components for sending.
            
            Conversation:
            {conversation_context}
            
            Extract and provide ONLY the following information in this exact format:
            
            RECIPIENT_EMAIL: [email address of the recipient]
            SUBJECT: [email subject line]
            BODY: [complete email body content]
            
            Requirements:
            - Find the recipient's email address from the conversation
            - Extract the subject line (if any) from the drafted email
            - Extract the complete email body content from the drafted email
            - If no explicit subject is found, suggest an appropriate cold outreach subject
            - Preserve all formatting and content from the drafted email body
        """).strip()
        
        logger.info("🧠 SEND EMAIL NODE: Calling LLM to extract email components")
        extraction_response = llm.invoke([HumanMessage(content=extraction_prompt)])
        extraction_content = extraction_response.content.strip()
        logger.info(f"📄 SEND EMAIL NODE: LLM extraction response ({len(extraction_content)} chars)")
        
        # Parse LLM response to extract components
        try:
            lines = extraction_content.split('\n')
            recipient_email = None
            subject = None
            body_lines = []
            
            current_section = None
            for line in lines:
                if line.startswith('RECIPIENT_EMAIL:'):
                    recipient_email = line.replace('RECIPIENT_EMAIL:', '').strip()
                elif line.startswith('SUBJECT:'):
                    subject = line.replace('SUBJECT:', '').strip()
                    current_section = 'subject'
                elif line.startswith('BODY:'):
                    current_section = 'body'
                    body_content = line.replace('BODY:', '').strip()
                    if body_content:
                        body_lines.append(body_content)
                elif current_section == 'body' and line.strip():
                    body_lines.append(line)
            
            body = '\n'.join(body_lines) if body_lines else ""
            
            logger.info(f"📧 SEND EMAIL NODE: Extracted - To: {recipient_email}, Subject: '{subject}'")
            
        except Exception as e:
            logger.error(f"❌ SEND EMAIL NODE: Failed to parse LLM extraction: {str(e)}")
            error_message = HumanMessage(content=f"""
            ❌ Failed to extract email components from conversation.
            
            Error: {str(e)}
            Please ensure the conversation contains the drafted email and recipient information.
            """)
            return {"messages": [error_message]}
        
        # Validate extracted components
        if not recipient_email:
            logger.warning("❌ SEND EMAIL NODE: No recipient email found")
            error_message = HumanMessage(content="""
            ❌ Cannot send email: No recipient email address found.
            
            Please provide the prospect's email address to send the outreach email.
            """)
            return {"messages": [error_message]}
        
        if not subject:
            subject = "Cold Outreach"
            logger.info("📋 SEND EMAIL NODE: Using default subject")
        
        if not body:
            logger.warning("❌ SEND EMAIL NODE: No email body found")
            error_message = HumanMessage(content="""
            ❌ Cannot send email: No email body content found.
            
            Please draft an email first before sending.
            """)
            return {"messages": [error_message]}
        
        logger.info(f"👤 SEND EMAIL NODE: Found recipient: {recipient_email}")

        try:
            # Send email via Siren
            logger.info("🚀 SEND EMAIL NODE: Calling Siren API to send email")
            siren_response = siren_client.call_tool(
                to=recipient_email,
                subject=subject,
                body=body
            )
            logger.info(f"✅ SEND EMAIL NODE: Siren API responded successfully: {siren_response}")

            await send_sim_event(
                room,
                {"type": "EMAIL_EVENT", "phase": "Complete", "room": room.name},
                topic="sim:email",
                identities=None,
                reliable=True,
            )
            
            # Success confirmation
            confirmation_message = HumanMessage(content=f"""
            ✅ Email sent successfully via Siren!
            
            To: {recipient_email}
            Subject: {subject}
            
            The personalized outreach email has been delivered to the prospect.
            I'll help you track responses and plan follow-ups when needed.
            """)
            
            logger.info("✅ SEND EMAIL NODE: Completed successfully")
            return {"messages": [confirmation_message]}
            
        except Exception as e:
            # Handle Siren API errors
            logger.error(f"❌ SEND EMAIL NODE: Siren API failed: {str(e)}")
            error_message = HumanMessage(content=f"""
            ❌ Failed to send email via Siren.
            
            Error: {str(e)}
            
            Please check your Siren API configuration and try again.
            """)
            
            return {"messages": [error_message]}
    
    def should_continue(state: GraphState):
        logger.info("🔀 ROUTING: Determining next step from agent")
        messages = state["messages"]
        last_message = messages[-1]
        
        logger.info(f"🔍 ROUTING: Analyzing last message type: {type(last_message).__name__}")
        
        if last_message.tool_calls:
            logger.info(f"🔧 ROUTING: Going to tools (found {len(last_message.tool_calls)} tool calls)")
            return "tools"
        
        # Use LLM to understand user intent from conversation context
        if hasattr(last_message, 'content') and last_message.content:
            # Get recent conversation for context (last 3 messages)
            recent_messages = messages
            conversation_context = "\\n".join([
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
                - "end" - for everything else (greetings, unclear, thanks, etc.)
                - "send_email" - only if explicitly requesting email sending
                
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
                logger.info("📧 ROUTING: Going to send_email (LLM detected email intent)")
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
        logger.info("🔀 EMAIL ROUTING: Checking user confirmation for email sending")
        messages = state["messages"]
        
        # Look for user confirmation in recent messages
        for msg in reversed(messages):  # Check last 3 messages for confirmation
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
    
    tool_node = ToolNode(linkedin_tools)
    
    workflow = StateGraph(GraphState)
    
    # Add all nodes
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", tool_node)
    workflow.add_node("draft_email", draft_email_node)
    workflow.add_node("confirm_email", confirm_email_node)
    workflow.add_node("send_email", send_email_node)
    workflow.add_node("output", output_node)
    
    workflow.set_entry_point("agent")
    
    # Agent routing
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
    
    # Tools always go back to agent
    workflow.add_edge("tools", "agent")
    
    # After drafting email, always go to confirmation node (human interrupt)
    workflow.add_edge("draft_email", "confirm_email")
    
    # Human confirmation routing (wait for user approval)
    workflow.add_edge(
        "confirm_email",
        "output",
    )
    
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
