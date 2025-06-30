from langgraph.graph import StateGraph
from langchain_core.runnables import RunnableLambda
from mentor_agent.agents.groq_agent import GroqMentorAgent
from mentor_agent.memory.store import get_user_memory, update_user_memory
from mentor_agent.models.conversation_state import MentorState
import os
import re

# Initialize the Groq LLM agent
groq_agent = GroqMentorAgent(groq_api_key=os.getenv("GROQ_API_KEY"))

def parse_reply_sections(reply: str):
    response_match = re.search(r"^\s*\**RESPONSE:\**\s*(.+?)(?=^\s*\**SENTIMENT:|\Z)", reply, re.DOTALL | re.IGNORECASE | re.MULTILINE)
    sentiment_match = re.search(r"^\s*\**SENTIMENT:\**\s*(\w+)", reply, re.IGNORECASE | re.MULTILINE)
    topic_match = re.search(r"^\s*\**TOPIC:\**\s*(.+)", reply, re.IGNORECASE | re.MULTILINE)

    return {
        "response": response_match.group(1).strip() if response_match else "No reply generated.",
        "sentiment": sentiment_match.group(1).strip().lower() if sentiment_match else "neutral",
        "topic": topic_match.group(1).strip().lower() if topic_match else "general"
    }

def analyze_and_respond(state: MentorState):
    user_id = state.user_id
    user_input = state.input

    # Fetch memory and profile
    memory = get_user_memory(user_id)
    profile = memory.get("profile", {})
    tasks = memory.get("tasks", [])
    history = memory.get("history", [])
    docs = memory.get("documents", [])

    # Build formatted prompt
    prompt = f"""
You are an AI mentor with a {profile.get("personality", "Concise")} personality.

### User Profile
Name: {profile.get('name')}
Goal: {profile.get('goal')}
Education: {profile.get('education')}

### Recent Messages
{', '.join(x['input'] for x in history[-3:])}

### Tasks
{', '.join(t['task'] for t in tasks[-3:])}

### Docs
{', '.join(d['filename'] for d in docs)}

Respond in **markdown format**, but only for the main response section. Sentiment and topic should be plain text and appear separately.

Format your output **exactly like this**:

RESPONSE:
<markdown message>

SENTIMENT: <positive | neutral | negative>
TOPIC: <1-3 word topic>
"""

    result = groq_agent.run(prompt)
    output_raw = result.get("output", "")
    parsed = parse_reply_sections(result.get("output", ""))

    # Save user input and parsed response to memory
    memory.setdefault("history", []).append({
        "input": user_input,
        "response": parsed["response"]
    })
    update_user_memory(user_id, memory)

    # Update the state with new fields
    state.reply = parsed["response"]  # markdown content for frontend
    state.analytics = {
        "sentiment": parsed["sentiment"],
        "topic": parsed["topic"]
    }

    return state

# Build the graph
builder = StateGraph(state_schema=MentorState)
builder.add_node("respond", RunnableLambda(analyze_and_respond))
builder.set_entry_point("respond")

mentor_graph = builder.compile()
