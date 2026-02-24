import google.generativeai as genai
from config.config import settings
from app.schemas.sermon import AISuggestionResponse

class AISermonService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Definimos el rol del mentor desde el inicio
        self.model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            system_instruction="Eres un mentor homilético que ayuda a pastores. Generas estructuras claras y bíblicas en formato JSON."
        )

    async def get_suggestions(self, title: str, content: str):
        prompt = f"Título: {title}\nNotas: {content}"
        response = self.model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json", "temperature": 0.7}
        )
        return AISuggestionResponse.model_validate_json(response.text)

ai_service = AISermonService()