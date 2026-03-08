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
        # Usamos v1beta que es la versión que contiene los modelos Flash más recientes
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options={'api_version': 'v1beta'}
        )
        # Nombre de modelo completo según documentación oficial
        self.model_id = "models/gemini-1.5-flash"
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
        
        Título del sermón: {title}
        Contenido actual: {content}
        
        RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO.
        Formato:
        {{
            "suggested_outline": "texto aqui",
            "related_verses": ["cita 1", "cita 2"]
        }}
        """

        try:
            # Configuración mínima recomendada por Google para el nuevo SDK
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7
                )
            )

            latency = time.perf_counter() - start_time
            logger.info(f"AI Success: {latency:.2f}s")
            
            # Limpieza de respuesta (quitar ```json si existe)
            text = response.text.strip()
            if "```" in text:
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            
            return AISuggestionResponse.model_validate_json(text.strip())

        except Exception as e:
            logger.error(f"AI Error: {str(e)}")
            # Fallback para no dejar la UI vacía
            return AISuggestionResponse(
                suggested_outline=f"Hubo un problema al conectar con Gemini: {str(e)}. Por favor, intente de nuevo.",
                related_verses=["Error de conexión"]
            )


ai_service = AISermonService()
