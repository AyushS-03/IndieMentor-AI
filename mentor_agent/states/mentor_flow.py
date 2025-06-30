from langgraph.graph import StateGraph
from langchain_core.runnables import RunnableLambda
from mentor_agent.agents.groq_agent import GroqMentorAgent
from mentor_agent.memory.store import get_user_memory, update_user_memory
from mentor_agent.models.conversation_state import MentorState
import os

groq_agent = GroqMentorAgent(groq_api_key=os.getenv("GROQ_API_KEY"))

def analyze_and_respond(state: MentorState):
    user_id = state.user_id
    user_input = state.input

    memory = get_user_memory(user_id)
    profile = memory.get("profile", {})
    tasks = memory.get("tasks", [])
    history = memory.get("history", [])
    docs = memory.get("documents", [])

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

Respond in **markdown format**. Include:
- Response to user's message: "{user_input}"
- Embedded follow-up relevant to their goals or past work
- Add a summary sentiment + topic

Format output as:
RESPONSE:
<markdown>

SENTIMENT: <positive/neutral/negative>
TOPIC: <detected topic>
"""

    result = groq_agent.run(prompt)
    reply = result.get("output", "No reply generated")

    memory.setdefault("history", []).append({
        "input": user_input,
        "response": reply
    })
    update_user_memory(user_id, memory)

    return {
        "reply": reply,
        "analytics": {
            "sentiment": result.get("sentiment", "neutral"),
            "topic": result.get("topic", "general")
        }
    }

# ✅ Register with schema
builder = StateGraph(state_schema=MentorState)
builder.add_node("respond", RunnableLambda(analyze_and_respond))
builder.set_entry_point("respond")

mentor_graph = builder.compile()
