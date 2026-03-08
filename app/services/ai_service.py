from google import genai
from google.genai import types
import time
import logging
from config.config import settings
from app.schemas.sermon import AISuggestionResponse

logger = logging.getLogger("ai_service")


class AISermonService:
    def __init__(self):
        # El nuevo SDK usa gemini-1.5-flash como nombre estándar
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-1.5-flash"
        self.system_instruction = "Eres un mentor homilético que ayuda a pastores. Generas estructuras claras y bíblicas en formato JSON con los campos 'suggested_outline' (string) y 'related_verses' (lista de strings)."

    async def get_suggestions(
        self, title: str, content: str, style: str = "encouraging"
    ):
        start_time = time.perf_counter()

        # Customize prompt based on style
        style_prompts = {
            "encouraging": "Enfócate en un tono pastoral, alentador y lleno de esperanza.",
            "academic": "Enfócate en un análisis exegético profundo, histórico y teológico.",
            "practical": "Enfócate en aplicaciones prácticas para la vida diaria y desafíos contemporáneos.",
        }

        style_instruction = style_prompts.get(style, style_prompts["encouraging"])

        prompt = f"Título: {title}\nNotas del sermón: {content}\n\nInstrucción de Estilo: {style_instruction}\n\nPor favor, genera una respuesta JSON válida."

        try:
            # En el nuevo SDK, GenerateContentConfig acepta system_instruction directamente
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    response_mime_type="application/json",
                    temperature=0.7,
                ),
            )

            latency = time.perf_counter() - start_time
            
            # El SDK nuevo devuelve el texto en response.text
            result_text = response.text
            
            logger.info(
                "AI suggestion generated successfully",
                extra={
                    "latency": latency,
                    "model": self.model_name,
                    "status": "success",
                },
            )
            
            return AISuggestionResponse.model_validate_json(result_text)

        except Exception as e:
            latency = time.perf_counter() - start_time
            logger.error(
                f"AI suggestion generation failed: {str(e)}",
                extra={
                    "latency": latency,
                    "model": self.model_name,
                    "status": "error",
                    "error_type": type(e).__name__,
                },
            )
            raise


ai_service = AISermonService()
