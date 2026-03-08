from openai import OpenAI
import time
import logging
import json
from config.config import settings
from app.schemas.sermon import AISuggestionResponse

logger = logging.getLogger("ai_service")


class AISermonService:
    def __init__(self):
        # Inicializamos el cliente de OpenAI con la API Key de las variables de entorno
        # Asegúrate de agregar OPENAI_API_KEY en Railway
        self.client = OpenAI(api_key=settings.get("OPENAI_API_KEY"))
        self.model_id = "gpt-4o-mini" # Modelo optimizado para velocidad y costo
        self.system_instruction = "Eres un mentor homilético experto. Ayudas a pastores a estructurar sermones bíblicos profundos y prácticos."

    async def get_suggestions(
        self, title: str, content: str, style: str = "encouraging"
    ):
        start_time = time.perf_counter()

        style_prompts = {
            "encouraging": "Tono pastoral, alentador y lleno de esperanza.",
            "academic": "Análisis exegético profundo, histórico y teológico.",
            "practical": "Enfoque en aplicaciones para la vida diaria y desafíos modernos.",
        }

        style_instruction = style_prompts.get(style, style_prompts["encouraging"])
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": self.system_instruction},
                    {"role": "user", "content": f"""
                        Actúa como mentor con el siguiente estilo: {style_instruction}
                        
                        Título del sermón: {title}
                        Notas del contenido: {content}
                        
                        Genera un análisis homilético en formato JSON estricto con los siguientes campos:
                        - suggested_outline: Una lista de strings con los puntos principales del bosquejo.
                        - verses_found: Una lista de strings con referencias bíblicas clave.
                        - central_theme: Un string breve con la tesis central del mensaje.
                        
                        Responde únicamente el objeto JSON.
                    """}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )

            latency = time.perf_counter() - start_time
            logger.info(f"AI Success with OpenAI {self.model_id} in {latency:.2f}s")
            
            result_text = response.choices[0].message.content
            if not result_text:
                raise ValueError("Respuesta vacía de OpenAI")

            return AISuggestionResponse.model_validate_json(result_text)

        except Exception as e:
            logger.error(f"AI Error (OpenAI): {str(e)}")
            return AISuggestionResponse(
                suggested_outline=["Error en el servicio de IA"],
                verses_found=[f"Detalle: {str(e)}"],
                central_theme="Por favor, verifique su OPENAI_API_KEY y saldo en la cuenta."
            )


ai_service = AISermonService()
