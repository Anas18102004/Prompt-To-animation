from .sub_agents.code_writer.agent import code_writer
from .sub_agents.script_writer.agent import script_writer
from google.adk.agents.sequential_agent import SequentialAgent

root_agent = SequentialAgent(
    name="manimation",
    sub_agents=[script_writer, code_writer],
    description="Executes a sequence of script_writer & code_writer",
)