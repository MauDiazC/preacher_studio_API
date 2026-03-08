from google import genai
from google.genai import types
import time
import logging
from config.config import settings
from app.schemas.sermon import AISuggestionResponse

logger = logging.getLogger("ai_service")


class AISermonService:
    def __init__(self):
        # El SDK de google-genai utiliza la API Key de forma directa
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        # Probamos con el prefijo models/ que es el estándar de Google
        self.model_id = "models/gemini-1.5-flash"
        self.system_instruction = "Eres un mentor homilético. Generas estructuras claras en JSON con 'suggested_outline' y 'related_verses'."

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
        
        # Combinamos la instrucción del sistema con el prompt para mayor compatibilidad
        full_prompt = f"{self.system_instruction}\n\nEstilo: {style_instruction}\n\nTítulo: {title}\nContenido: {content}\n\nResponde SOLO en formato JSON."

        try:
            # Versión simplificada de la llamada
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.7,
                ),
            )

            latency = time.perf_counter() - start_time
            logger.info(f"AI Suggestion success in {latency:.2f}s")
            
            # El texto en el nuevo SDK está en response.text
            return AISuggestionResponse.model_validate_json(response.text)

        except Exception as e:
            logger.error(f"AI Error: {str(e)}")
            # Fallback en caso de error para no romper la UI
            return AISuggestionResponse(
                suggested_outline="Lo siento, hubo un error técnico al conectar con Gemini. Por favor, intente de nuevo en unos minutos.",
                related_verses=["Error de conexión con el servicio de IA"]
            )


ai_service = AISermonService()
