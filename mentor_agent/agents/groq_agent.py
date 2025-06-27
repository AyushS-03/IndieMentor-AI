import os
from langchain_groq import ChatGroq
from langchain.agents import initialize_agent, AgentType

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))


class GroqMentorAgent:
    def __init__(self, groq_api_key: str = None, model: str = "llama3-8b-8192"):
        self.groq_api_key = groq_api_key or os.getenv("GROQ_API_KEY")
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
