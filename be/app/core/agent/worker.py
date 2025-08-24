from livekit import agents
from livekit.agents import (
    AgentSession,
    Agent,
    RoomInputOptions,
    JobProcess,
)
from livekit.plugins import (
    deepgram,
    noise_cancellation,
    silero,
)
from livekit.plugins.langchain import LLMAdapter
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Cold outreach agent prompt
COLD_OUTREACH_AGENT_PROMPT = """
You are an AI agent specialized in helping with cold outreach campaigns. Your role is to:

1. Assist in crafting personalized and effective cold outreach messages
2. Provide guidance on outreach strategies and best practices
3. Help analyze and improve outreach performance
4. Suggest personalization techniques for better engagement
5. Offer advice on follow-up sequences and timing

Always maintain a professional, helpful, and results-oriented approach. Focus on building genuine connections rather than being pushy or salesy.
"""

# Default voice for the agent
DEFAULT_VOICE = "aura-2-atlas-en"


class Assistant(Agent):
    def __init__(self, instructions: str = COLD_OUTREACH_AGENT_PROMPT, **kwargs) -> None:
        # Pass llm in via kwargs if provided
        super().__init__(instructions=instructions, **kwargs)

    # If you ever want to override the node directly, uncomment and implement:
    # async def llm_node(
    #     self,
    #     chat_ctx: ChatContext,
    #     tools: list[FunctionTool],
    #     model_settings: ModelSettings,
    # ) -> AsyncIterable[ChatChunk]:
    #     ...


async def entrypoint(ctx: agents.JobContext):
    logger.info(f"Starting cold outreach agent session for room: {ctx.room.name}")
    
    # Use the cold outreach agent prompt
    selected_prompt = COLD_OUTREACH_AGENT_PROMPT
    voice_model = DEFAULT_VOICE
    logger.info(f"Using voice model: {voice_model}")

    from app.core.agent.graph import create_graph
    llm_test = create_graph()
    llm_test_adapter = LLMAdapter(llm_test)

    # Session: no LLM here
    session = AgentSession(
        stt=deepgram.STT(
            model="nova-3",
            language="multi",
            api_key=settings.DEEPGRAM_API_KEY,
        ),
        tts=deepgram.TTS(
            model=voice_model,
            encoding="linear16",
            sample_rate=24000,
            api_key=settings.DEEPGRAM_API_KEY,
        ),
        vad=ctx.proc.userdata["vad"],
        turn_detection=MultilingualModel(),
    )

    # Agent: give it the LLM adapter
    agent = Assistant(instructions=selected_prompt, llm=llm_test_adapter)

    # Optional sanity check (remove if noisy)
    try:
        inner = type(agent.llm._adapter).__name__  # noqa: SLF001
        logger.debug(f"LLMAdapter inner: {inner}")  # Expect: LangChainAdapter
    except Exception:
        pass

    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load(activation_threshold=0.7)


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint,prewarm_fnc=prewarm,num_idle_processes=1,api_key=settings.LIVEKIT_API_KEY,
                                           api_secret=settings.LIVEKIT_API_SECRET, ws_url=settings.LIVEKIT_URL))
