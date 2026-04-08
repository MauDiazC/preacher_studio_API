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
        
        self.gemini_model = "gemini-1.5-flash"
        self.system_instruction = "Eres un mentor homilético experto. Ayudas a pastores a estructurar sermones bíblicos profundos y prácticos."
        self._exegesis_cache = {}

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

    async def analyze_verse(self, verse_reference: str, language: str = "es") -> VerseExegesisResponse:
        cache_key = f"{language}:{verse_reference.strip().lower()}"
        if cache_key in self._exegesis_cache:
            logger.info(f"CACHE HIT for verse: {verse_reference}")
            return self._exegesis_cache[cache_key]

        start_time = time.perf_counter()
        
        # Ajuste dinámico de versiones según idioma
        if language == "es":
            bible_instruction = "version_rv1960 debe ser Reina Valera 1960, version_nvi debe ser Nueva Versión Internacional."
        else:
            bible_instruction = "version_rv1960 MUST BE King James Version (KJV), version_nvi MUST BE New International Version (NIV). DO NOT USE SPANISH VERSIONS."

        user_prompt = f"""
        Realiza un análisis exegético profundo y académico del siguiente pasaje bíblico: "{verse_reference}"
        
        IMPORTANTE: Responde TODO el contenido del JSON en el idioma: {language.upper()} (excepto términos técnicos en Griego/Hebreo).
        
        {bible_instruction}
        
        Tu análisis debe ser exhaustivo y teológicamente sólido.
        
        Debes devolver UNICAMENTE un objeto JSON con la siguiente estructura exacta:
        {{
            "literary_type": "Análisis detallado del género literario y su impacto en la interpretación.",
            "author": "Información histórica y académica sobre la autoría.",
            "purpose": "El propósito teológico y pastoral original del pasaje.",
            "historical_context": "Contexto sociocultural, político y geográfico detallado de la época.",
            "significance_context": "Significancia teológica profunda y alusiones culturales o religiosas.",
            {bible_versions}
            "original_languages": "Análisis léxico-profesional. Para las 3 palabras más importantes del pasaje, incluye: 1) Palabra en original (Hebreo/Griego), 2) Transliteración, 3) Número de Strong, 4) Definición detallada basada en el Léxico de Thayer (si es NT) o Brown-Driver-Briggs (si es AT). Proporciona esto como una cadena de texto académica y estructurada.",
            "source_attribution": "Indica de qué comentarios académicos clásicos y contemporáneos (ej. Matthew Henry, Barclay, Kittel) proviene este análisis.",
            "key_locations": ["Lista de strings con los nombres de ciudades o regiones geográficas mencionadas en el pasaje o su contexto inmediato. (Usa nombres en ESPAÑOL si el idioma es ES, o en INGLÉS si el idioma es EN)"]
        }}
        """

        # Intento primario con Gemini 1.5 Flash (Nuevo SDK)
        if self.gemini_client:
            try:
                logger.info(f"Iniciando análisis con Gemini para: {verse_reference} ({language})")
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
                
                result = VerseExegesisResponse.model_validate_json(response.text)
                self._exegesis_cache[cache_key] = result
                return result
            except Exception as e:
                logger.error(f"AI PROVIDER: GOOGLE GEMINI | Status: Failed | Error: {str(e)}", exc_info=True)
                start_time = time.perf_counter()
        else:
            logger.warning("Gemini client NOT initialized (missing API key?)")

        # Fallback a OpenAI
        try:
            logger.info(f"Iniciando fallback a OpenAI para: {verse_reference}")
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
