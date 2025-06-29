import os
from langchain_groq import ChatGroq
from langchain.agents import initialize_agent, AgentType

from dotenv import load_dotenv, find_dotenv

# Automatically find and load .env files
load_dotenv(find_dotenv())
load_dotenv(find_dotenv(".env.local"))


class GroqMentorAgent:
    def __init__(self, groq_api_key: str = None, model: str = "llama3-8b-8192"):
        self.groq_api_key = groq_api_key or os.getenv("GROQ_API_KEY")
        # self.groq_api_key = "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"
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY is required")

        self.llm = ChatGroq(api_key=self.groq_api_key, model_name=model)
        self.agent = initialize_agent(
            tools=[],
            llm=self.llm,
            agent=AgentType.OPENAI_FUNCTIONS,
            verbose=True
        )

    def run(self, user_input: str):
        return self.agent.invoke({"input": user_input})
