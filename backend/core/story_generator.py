import os

from dotenv import load_dotenv
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy.orm import Session

from core.config import core_setting_config
from core.models import StoryLLMResponse, StoryNodeLLM
from core.prompts import STORY_PROMPT
from models.story import Story, StoryNode

load_dotenv()


class StoryGenerator:
    @classmethod
    def _get_llm(cls):
        api_key = (
            core_setting_config.GEMINI_API_KEY
            or os.getenv("GEMINI_API_KEY")
            or os.getenv("GOOGLE_API_KEY")
        )
        model = (
            core_setting_config.GEMINI_MODEL
            or os.getenv("GEMINI_MODEL")
            or "gemini-3.5-flash-lite"
        )
        return ChatGoogleGenerativeAI(
            model=model,
            api_key=api_key,
        )

    @classmethod
    def generate_story(
        cls, db: Session, session_id: str, theme: str = "fantasy"
    ) -> Story:
        llm = cls._get_llm()
        story_parser = PydanticOutputParser(
            pydantic_object=StoryLLMResponse
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", STORY_PROMPT),
                ("human", f"Create the story with this theme: {theme}"),
            ]
        ).partial(
            format_instructions=story_parser.get_format_instructions()
        )

        raw_response = llm.invoke(prompt.invoke({}))

        response_text = raw_response
        if hasattr(raw_response, "content"):
            content = raw_response.content
            if isinstance(content, list):
                response_text = "".join(
                    part.get("text", "")
                    if isinstance(part, dict)
                    else str(part)
                    for part in content
                )
            else:
                response_text = str(content)
        else:
            response_text = str(raw_response)

        clean_text = response_text.strip()
        if clean_text.startswith("```"):
            lines = clean_text.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_text = "\n".join(lines).strip()

        story_structure = story_parser.parse(clean_text)

        story_db = Story(title=story_structure.title, session_id=session_id)
        db.add(story_db)
        db.flush()

        root_node_data = story_structure.rootNode
        if isinstance(root_node_data, dict):
            root_node_data = StoryNodeLLM.model_validate(root_node_data)

        cls._process_story_node(db, story_db.id, root_node_data, is_root=True)

        db.commit()
        return story_db

    @classmethod
    def _process_story_node(
        cls,
        db: Session,
        story_id: int,
        node_data: StoryNodeLLM,
        is_root: bool = False,
    ) -> StoryNode:
        content = (
            node_data.content
            if hasattr(node_data, "content")
            else node_data["content"]
        )
        is_ending = (
            node_data.isEnding
            if hasattr(node_data, "isEnding")
            else node_data["isEnding"]
        )
        is_winning_ending = (
            node_data.isWinningEnding
            if hasattr(node_data, "isWinningEnding")
            else node_data["isWinningEnding"]
        )

        node = StoryNode(
            story_id=story_id,
            content=content,
            is_root=is_root,
            is_ending=is_ending,
            is_winning_ending=is_winning_ending,
            options=[],
        )
        db.add(node)
        db.flush()

        has_options = hasattr(node_data, "options") and node_data.options
        if not node.is_ending and has_options:
            options_list = []
            for option_data in node_data.options:
                next_node = option_data.nextNode

                if isinstance(next_node, dict):
                    next_node = StoryNodeLLM.model_validate(next_node)

                child_node = cls._process_story_node(
                    db, story_id, next_node, False
                )

                options_list.append(
                    {"text": option_data.text, "node_id": child_node.id}
                )

            node.options = options_list

        db.flush()
        return node
