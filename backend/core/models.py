from pydantic import BaseModel


class StoryOptionLLM(BaseModel):
    text: str
    nextNode: "StoryNodeLLM | None" = None


class StoryNodeLLM(BaseModel):
    content: str
    isEnding: bool = False
    isWinningEnding: bool = False
    options: list[StoryOptionLLM] = []


class StoryLLMResponse(BaseModel):
    title: str
    rootNode: StoryNodeLLM
