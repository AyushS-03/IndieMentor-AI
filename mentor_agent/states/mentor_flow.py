from langgraph.graph import StateGraph, END
from pydantic import BaseModel
from langchain_core.runnables import RunnableLambda
from typing import List, Optional
import datetime
import json
import os

MEMORY_PATH = "mentor_agent/memory/user_memory.json"

def load_user_state(input):
    user_id = input.get("user_id")
    if os.path.exists(MEMORY_PATH):
        with open(MEMORY_PATH, "r") as f:
            data = json.load(f)
            return data.get(user_id, {"tasks": [], "history": [], "documents": []})
    return {"tasks": [], "history": [], "documents": []}

def analyze_input(state):
    input_text = state.get("input")
    if "done" in input_text.lower():
        return {**state, "action": "check_task"}
    elif "today" in input_text.lower() or "learned" in input_text.lower():
        return {**state, "action": "log_learning"}
    else:
        return {**state, "action": "assign_task"}

def mentor_response(state):
    action = state.get("action")
    if action == "assign_task":
        task = f"Study data structures on {datetime.date.today()}"
        state["tasks"].append({"task": task, "status": "assigned"})
        reply = f"I want you to complete this task: {task}"
    elif action == "check_task":
        reply = f"Great! I'll mark your last task as complete."
        if state["tasks"]:
            state["tasks"][-1]["status"] = "done"
    elif action == "log_learning":
        reply = "Thanks for sharing what you learned today. I’ll build on that tomorrow."
    else:
        reply = "Let’s keep pushing!"
    state["reply"] = reply
    return state

def save_user_state(state):
    user_id = state.get("user_id")
    if not user_id:
        return state
    if os.path.exists(MEMORY_PATH):
        with open(MEMORY_PATH, "r") as f:
            all_data = json.load(f)
    else:
        all_data = {}
    all_data[user_id] = state
    with open(MEMORY_PATH, "w") as f:
        json.dump(all_data, f, indent=2)
    return state

class MentorInput(BaseModel):
    input: str
    user_id: str
    tasks: Optional[List[dict]] = []
    history: Optional[List[dict]] = []
    documents: Optional[List[dict]] = []
    reply: Optional[str] = None
    action: Optional[str] = None

builder = StateGraph(MentorInput)

builder.add_node("load", RunnableLambda(load_user_state))
builder.add_node("analyze", RunnableLambda(analyze_input))
builder.add_node("respond", RunnableLambda(mentor_response))
builder.add_node("save", RunnableLambda(save_user_state))

builder.set_entry_point("load")
builder.add_edge("load", "analyze")
builder.add_edge("analyze", "respond")
builder.add_edge("respond", "save")
builder.add_edge("save", END)

mentor_graph = builder.compile()
