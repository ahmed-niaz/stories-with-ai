from datetime import datetime

from pydantic import BaseModel


class StoryOptionsSchema(BaseModel):
    text: str
    node_id: int | None = None


# parent class for story node and story
class StoryNodeBase(BaseModel):
    content: str
    is_ending: bool = False
    is_winning_ending: bool = False


# response of the api or return to the frontend
class CompleteStoryNodeResponse(StoryNodeBase):
    id: int
    options: list[StoryOptionsSchema] = []

    class Config:
        from_attributes = True


class StoryBase(BaseModel):
    title: str
    session_id: str | None = None

    class Config:
        from_attributes = True


class CreateStoryRequest(BaseModel):
    theme: str


class CompleteStoryResponse(StoryBase):
    id: int
    created_at: datetime
    root_node: CompleteStoryNodeResponse
    all_nodes: dict[int, CompleteStoryNodeResponse]

    class Config:
        from_attributes = True
