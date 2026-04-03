from openai import OpenAI
from google import genai
from google.genai import types
import time
import logging
import json
from config.config import settings
from app.schemas.sermon import AISuggestionResponse, VerseExegesisResponse

logger = logging.getLogger("ai_service")


class AISermonService:
    def __init__(self):
        # OpenAI Fallback
        openai_key = settings.get("OPENAI_API_KEY", "dummy_key")
        self.client = OpenAI(api_key=openai_key)
        self.model_id = "gpt-4o-mini"
        
        # Gemini 1.5 Flash (Nuevo SDK google-genai)
        self.gemini_api_key = settings.get("GEMINI_API_KEY")
        self.gemini_client = None
        
        if self.gemini_api_key:
            # Usamos el cliente con configuración por defecto
            self.gemini_client = genai.Client(api_key=self.gemini_api_key)
        
        self.gemini_model = "gemini-1.5-flash-latest"
        self.system_instruction = "Eres un mentor homilético experto. Ayudas a pastores a estructurar sermones bíblicos profundos y prácticos."

    async def get_suggestions(self, title: str, content: str, style: str = "encouraging"):
        start_time = time.perf_counter()

        style_prompts = {
            "encouraging": "Tono pastoral, alentador y lleno de esperanza.",
            "academic": "Análisis exegético profundo, histórico y teológico.",
            "practical": "Enfoque en aplicaciones para la vida diaria y desafíos modernos.",
        }

        style_instruction = style_prompts.get(style, style_prompts["encouraging"])
        
        user_prompt = f"""
            Actúa como mentor con el siguiente estilo: {style_instruction}
            
            Título del sermón: {title}
            Notas del contenido: {content}
            
            Genera un análisis homilético en formato JSON estricto con los siguientes campos:
            - suggested_outline: Una lista de strings con los puntos principales del bosquejo.
            - verses_found: Una lista de strings con referencias bíblicas clave.
            - central_theme: Un string breve con la tesis central del mensaje.
            
            Responde únicamente el objeto JSON.
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": self.system_instruction},
                    {"role": "user", "content": user_prompt}
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

    async def analyze_verse(self, verse_reference: str) -> VerseExegesisResponse:
        start_time = time.perf_counter()
        
        user_prompt = f"""
        Realiza un análisis exegético profundo y académico del siguiente pasaje bíblico: "{verse_reference}"
        
        Tu análisis debe ser exhaustivo y teológicamente sólido.
        
        Debes devolver UNICAMENTE un objeto JSON con la siguiente estructura exacta:
        {{
            "literary_type": "Análisis detallado del género literario y su impacto en la interpretación.",
            "author": "Información histórica y académica sobre la autoría.",
            "purpose": "El propósito teológico y pastoral original del pasaje.",
            "historical_context": "Contexto sociocultural, político y geográfico detallado de la época.",
            "significance_context": "Significancia teológica profunda y alusiones culturales o religiosas.",
            "version_rv1960": "El texto exacto en la versión Reina Valera 1960.",
            "version_nvi": "El texto exacto en la versión Nueva Versión Internacional.",
            "original_languages": "Análisis de términos clave en Hebreo (si es AT) o Griego (si es NT) proporcionado como una cadena de texto detallada, incluyendo transliteración, significado original y matices teológicos.",
            "source_attribution": "Indica de qué fuentes, comentarios clásicos (ej. Matthew Henry, Spurgeon) o corrientes teológicas proviene este análisis."
        }}
        """

        # Intento primario con Gemini 1.5 Flash (Nuevo SDK)
        if self.gemini_client:
            try:
                response = self.gemini_client.models.generate_content(
                    model=self.gemini_model,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.3,
                        system_instruction="Eres un erudito en exégesis bíblica, lenguajes originales (hebreo/griego) e historia teológica. Proporcionas análisis profundos y precisos para pastores."
                    )
                )
                latency = time.perf_counter() - start_time
                logger.info(f"AI PROVIDER: GOOGLE GEMINI | Status: Success | Latency: {latency:.2f}s")
                
                return VerseExegesisResponse.model_validate_json(response.text)
            except Exception as e:
                logger.warning(f"AI PROVIDER: GOOGLE GEMINI | Status: Failed | Error: {str(e)}. Falling back to OpenAI...")
                start_time = time.perf_counter()

        # Fallback a OpenAI
        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": "Eres un erudito en exégesis bíblica, lenguajes originales (hebreo/griego) e historia teológica. Proporcionas análisis profundos y precisos para pastores."},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )

            latency = time.perf_counter() - start_time
            logger.info(f"AI PROVIDER: OPENAI (gpt-4o-mini) | Status: Success | Latency: {latency:.2f}s")
            
            result_text = response.choices[0].message.content
            return VerseExegesisResponse.model_validate_json(result_text)

        except Exception as e:
            logger.error(f"AI PROVIDER: BOTH | Status: Critical Failure | Error: {str(e)}")
            raise ValueError(f"Error crítico al analizar el pasaje: {str(e)}")

ai_service = AISermonService()
