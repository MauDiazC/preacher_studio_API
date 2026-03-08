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
        # El nuevo SDK utiliza v1 por defecto para estabilidad
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
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
        
        # Reforzamos la instrucción JSON en el prompt ya que quitamos response_mime_type
        prompt = f"""
        Instrucción: {self.system_instruction}
        Estilo: {style_instruction}
        
        Título del sermón: {title}
        Contenido actual: {content}
        
        RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO.
        Formato esperado:
        {{
            "suggested_outline": "texto del bosquejo",
            "related_verses": ["cita 1", "cita 2"]
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                ),
            )

            latency = time.perf_counter() - start_time
            logger.info(f"AI Suggestion success in {latency:.2f}s")
            
            # Limpiar la respuesta por si Gemini añade bloques de código markdown
            text_res = response.text.strip()
            if text_res.startswith("```json"):
                text_res = text_res.replace("```json", "").replace("```", "").strip()
            
            return AISuggestionResponse.model_validate_json(text_res)

        except Exception as e:
            logger.error(f"AI Error: {str(e)}")
            return AISuggestionResponse(
                suggested_outline="Lo siento, hubo un error al procesar la respuesta de la IA. Por favor, intente de nuevo.",
                related_verses=["Error en el formato de respuesta"]
            )


ai_service = AISermonService()
