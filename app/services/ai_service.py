from openai import OpenAI
import google.generativeai as genai
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
        
        # Gemini 1.5 Flash
        self.gemini_api_key = settings.get("GEMINI_API_KEY")
        self.gemini_model_mentor = None
        self.gemini_model_exegesis = None
        
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model_mentor = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction="Eres un mentor homilético experto. Ayudas a pastores a estructurar sermones bíblicos profundos y prácticos."
            )
            self.gemini_model_exegesis = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction="Eres un experto en exégesis bíblica, historia y teología."
            )

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

        # Se mantiene OpenAI para sugerencias por consistencia, como se pidió.
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
        Realiza un análisis exegético del siguiente versículo o pasaje: "{verse_reference}"
        
        Debes devolver UNICAMENTE un objeto JSON con la siguiente estructura exacta:
        {{
            "literary_type": "string - Tipo literario del texto (ej. poesía, carta, histórico, profético)",
            "author": "string - Quién lo escribió (históricamente)",
            "purpose": "string - Por qué lo escribió o el propósito original del libro/pasaje",
            "historical_context": "string - Contexto histórico, usos y costumbres de la época",
            "significance_context": "string - Contexto de significancia, a qué se refería específicamente en esa circunstancia"
        }}
        """

        # Intento primario con Gemini 1.5 Flash
        if self.gemini_model_exegesis:
            try:
                response = self.gemini_model_exegesis.generate_content(
                    contents=user_prompt,
                    generation_config=genai.GenerationConfig(
                        response_mime_type="application/json",
                        temperature=0.3
                    )
                )
                latency = time.perf_counter() - start_time
                logger.info(f"AI Success with Gemini 1.5 Flash in {latency:.2f}s")
                
                result_text = response.text
                return VerseExegesisResponse.model_validate_json(result_text)
            except Exception as e:
                logger.warning(f"AI Error (Gemini): {str(e)}. Falling back to OpenAI...")
                start_time = time.perf_counter() # Reset para medir el fallback

        # Fallback a OpenAI
        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": "Eres un experto en exégesis bíblica, historia y teología."},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )

            latency = time.perf_counter() - start_time
            logger.info(f"AI Success with OpenAI {self.model_id} (Exegesis) in {latency:.2f}s")
            
            result_text = response.choices[0].message.content
            if not result_text:
                raise ValueError("Respuesta vacía de OpenAI")

            return VerseExegesisResponse.model_validate_json(result_text)

        except Exception as e:
            logger.error(f"AI Error (OpenAI Exegesis): {str(e)}")
            raise ValueError(f"Error al analizar el versículo: {str(e)}")

ai_service = AISermonService()
