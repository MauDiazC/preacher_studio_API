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
        # Inicialización totalmente vainilla según la doc oficial del nuevo SDK
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        # Usamos el nombre estándar sin prefijos
        self.model_id = "gemini-1.5-flash"
        self.system_instruction = "Eres un mentor homilético. Generas estructuras en JSON con 'suggested_outline' (lista), 'verses_found' (lista) y 'central_theme' (string)."

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
        
        Estilo solicitado: {style_instruction}
        
        Título del sermón: {title}
        Contenido actual: {content}
        
        RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO CON ESTA ESTRUCTURA:
        {{
            "suggested_outline": ["Punto 1", "Punto 2"],
            "verses_found": ["Cita 1", "Cita 2"],
            "central_theme": "Resumen del tema"
        }}
        """

        try:
            # Llamada estándar
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )

            latency = time.perf_counter() - start_time
            logger.info(f"AI Success with {self.model_id} in {latency:.2f}s")
            
            text = response.text.strip()
            # Limpieza de markdown por si acaso
            if "```" in text:
                parts = text.split("```")
                for part in parts:
                    if "{" in part:
                        text = part.replace("json", "", 1).strip()
                        break
            
            return AISuggestionResponse.model_validate_json(text)

        except Exception as e:
            logger.error(f"AI Error ({self.model_id}): {str(e)}")
            return AISuggestionResponse(
                suggested_outline=["Error en el servicio de IA"],
                verses_found=[f"Detalle: {str(e)}"],
                central_theme="Verifique que la API de Gemini esté habilitada en su Google Cloud Console."
            )


ai_service = AISermonService()
