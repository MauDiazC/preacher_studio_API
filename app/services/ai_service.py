from google import genai
from google.genai import types
import time
import logging
import json
from config.config import settings
from app.schemas.sermon import AISuggestionResponse

logger = logging.getLogger("ai_service")


class AISermonService:
    def __init__(self):
        # Forzamos v1 en el cliente para evitar el error de v1beta del SDK
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options={'api_version': 'v1'}
        )
        self.model_id = "gemini-1.5-flash"
        self.system_instruction = "Eres un mentor homilético. Generas estructuras en JSON con 'suggested_outline' y 'related_verses'."

    async def get_suggestions(
        self, title: str, content: str, style: str = "encouraging"
    ):
        start_time = time.perf_counter()

        style_prompts = {
            "encouraging": "Tono pastoral y alentador.",
            "academic": "Análisis exegético profundo.",
            "practical": "Aplicaciones para la vida diaria.",
        }

        style_instruction = style_prompts.get(style, style_prompts["encouraging"])
        
        prompt = f"""
        {self.system_instruction}
        Estilo: {style_instruction}
        
        Título: {title}
        Contenido: {content}
        
        Genera un objeto JSON con esta estructura:
        {{
            "suggested_outline": "...",
            "related_verses": ["...", "..."]
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )

            latency = time.perf_counter() - start_time
            logger.info(f"AI success in {latency:.2f}s")
            
            text_res = response.text.strip()
            if "```" in text_res:
                text_res = text_res.split("```")[1]
                if text_res.startswith("json"):
                    text_res = text_res[4:]
            
            return AISuggestionResponse.model_validate_json(text_res.strip())

        except Exception as e:
            logger.error(f"AI Error: {str(e)}")
            return AISuggestionResponse(
                suggested_outline=f"Error: {str(e)}. Intente de nuevo.",
                related_verses=["Error técnico"]
            )


ai_service = AISermonService()
