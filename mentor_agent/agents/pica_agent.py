from pica_langchain import PicaClient, create_pica_agent
from langchain_openai import ChatOpenAI
from langchain.agents import AgentType

class PicaMentorAgent:
    def __init__(self, pica_secret: str, model: str = "gpt-4.1", temperature: float = 0):
        self.pica_client = PicaClient(secret="sk_test_1_7emlH7Fop_uPfDdwwAgjfVkx7BxwAiyxVVzY_k_demUE1O0cep928Is_8WyrAT1ahg16UI8DRigqrvvm5_Fb3yrJjOwEH15EychePW7tPOCiBzHNVYLGy0Pw3OVs7Xo-U6_IrHSmPeyWVOJVCEGJUPzp0c0YfbaDYkid0FcF06N4oAoPndyDx9PIctMVS0q23I3KpoKfwaA2bhTNfCGjYZYjTDMidQZ3psaA7YFiaA")
        self.llm = ChatOpenAI(temperature=temperature, model=model)
        self.agent = create_pica_agent(
            client=self.pica_client,
            llm=self.llm,
            agent_type=AgentType.OPENAI_FUNCTIONS
        )

    def run(self, user_input: str):
        return self.agent.invoke({"input": user_input})