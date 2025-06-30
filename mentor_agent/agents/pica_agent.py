from pica_langchain import PicaClient, create_pica_agent
from langchain_openai import ChatOpenAI
from langchain.agents import AgentType

class PicaMentorAgent:
    def __init__(self, pica_secret: str, model: str = "gpt-4.1", temperature: float = 0):
        self.pica_client = PicaClient(secret=os.getencv("PICA_SECRET", pica_secret))
        self.llm = ChatOpenAI(temperature=temperature, model=model)
        self.agent = create_pica_agent(
            client=self.pica_client,
            llm=self.llm,
            agent_type=AgentType.OPENAI_FUNCTIONS
        )

    def run(self, user_input: str):
        return self.agent.invoke({"input": user_input})