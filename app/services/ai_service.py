from google import genai
from google.genai import types
import time
import logging
from config.config import settings
from app.schemas.sermon import AISuggestionResponse

logger = logging.getLogger("ai_service")


class AISermonService:
    def __init__(self):
        # Inicialización simple del cliente
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_id = "gemini-1.5-flash"
        self.system_instruction = "Eres un mentor homilético profesional. Generas estructuras claras y bíblicas en formato JSON con los campos 'suggested_outline' (string) y 'related_verses' (lista de strings)."

    async def get_suggestions(
        self, title: str, content: str, style: str = "encouraging"
    ):
        start_time = time.perf_counter()

        style_prompts = {
            "encouraging": "Enfócate en un tono pastoral y alentador.",
            "academic": "Enfócate en un análisis exegético profundo.",
            "practical": "Enfócate en aplicaciones prácticas para la vida diaria.",
        }

        style_instruction = style_prompts.get(style, style_prompts["encouraging"])
        prompt = f"Título: {title}\nContenido actual: {content}\nEstilo: {style_instruction}\n\nGenera una respuesta JSON."

        try:
            # Llamada directa al modelo flash
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    response_mime_type="application/json",
                    temperature=0.7,
                ),
            )

            latency = time.perf_counter() - start_time
            logger.info(f"AI suggestion generated in {latency:.2f}s")
            
            return AISuggestionResponse.model_validate_json(response.text)

        except Exception as e:
            logger.error(f"AI Error: {str(e)}")
            raise


ai_service = AISermonService()
