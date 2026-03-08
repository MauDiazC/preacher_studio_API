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
        # Usamos la configuración más básica para evitar errores de versión
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        # Probamos con gemini-1.5-flash-002 que es más específico y suele estar en v1
        self.model_id = "gemini-1.5-flash"

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
        
        # Ajustamos el prompt EXACTAMENTE a lo que espera AISuggestionResponse
        prompt = f"""
        Actúa como un mentor homilético profesional.
        Estilo solicitado: {style_instruction}
        
        Título del sermón: {title}
        Contenido actual: {content}
        
        RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO con esta estructura:
        {{
            "suggested_outline": ["Punto 1", "Punto 2", "Punto 3"],
            "verses_found": ["Cita Bíblica 1", "Cita Bíblica 2"],
            "central_theme": "Breve resumen del tema central"
        }}
        """

        try:
            # Llamada sin GenerateContentConfig para máxima compatibilidad con v1/v1beta
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )

            latency = time.perf_counter() - start_time
            logger.info(f"AI success in {latency:.2f}s")
            
            text_res = response.text.strip()
            # Limpieza de markdown
            if "```" in text_res:
                text_res = text_res.split("```")[1]
                if text_res.startswith("json"):
                    text_res = text_res[4:]
            
            # Validamos contra el esquema real de app/schemas/sermon.py
            return AISuggestionResponse.model_validate_json(text_res.strip())

        except Exception as e:
            logger.error(f"AI Error: {str(e)}")
            # Fallback que cumple con el esquema AISuggestionResponse
            return AISuggestionResponse(
                suggested_outline=["Error al conectar con la IA"],
                verses_found=[f"Detalle: {str(e)}"],
                central_theme="Servicio temporalmente no disponible"
            )


ai_service = AISermonService()
