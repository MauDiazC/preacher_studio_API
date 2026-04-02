import pytest
from unittest.mock import MagicMock, patch
from app.services.ai_service import AISermonService
from app.schemas.sermon import AISuggestionResponse, VerseExegesisResponse


@pytest.fixture
def ai_service():
    with patch("google.generativeai.configure"):
        with patch("google.generativeai.GenerativeModel") as MockModel:
            mock_instance = MockModel.return_value
            service = AISermonService()
            service.client = MagicMock()
            service.gemini_model_exegesis = mock_instance
            return service


@pytest.mark.asyncio
async def test_get_suggestions_success(ai_service):
    mock_response = MagicMock()
    mock_message = MagicMock()
    mock_message.content = '{"suggested_outline": ["Punto 1", "Punto 2"], "verses_found": ["Juan 3:16"], "central_theme": "Amor de Dios"}'
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_response.choices = [mock_choice]

    ai_service.client.chat.completions.create.return_value = mock_response

    result = await ai_service.get_suggestions(
        "Título de prueba", "Contenido de prueba"
    )

    assert isinstance(result, AISuggestionResponse)
    assert result.central_theme == "Amor de Dios"
    assert len(result.suggested_outline) == 2
    assert "Juan 3:16" in result.verses_found
    ai_service.client.chat.completions.create.assert_called_once()


@pytest.mark.asyncio
async def test_analyze_verse_gemini_success(ai_service):
    mock_response = MagicMock()
    mock_response.text = '{"literary_type": "Evangelio", "author": "Juan", "purpose": "Salvación", "historical_context": "Israel s. I", "significance_context": "Diálogo con Nicodemo"}'
    ai_service.gemini_model_exegesis.generate_content.return_value = mock_response
    
    result = await ai_service.analyze_verse("Juan 3:16")
    
    assert isinstance(result, VerseExegesisResponse)
    assert result.author == "Juan"
    assert result.purpose == "Salvación"
    ai_service.gemini_model_exegesis.generate_content.assert_called_once()


@pytest.mark.asyncio
async def test_analyze_verse_openai_fallback(ai_service):
    # Force Gemini to fail
    ai_service.gemini_model_exegesis.generate_content.side_effect = Exception("Gemini down")
    
    # Mock OpenAI fallback
    mock_response = MagicMock()
    mock_message = MagicMock()
    mock_message.content = '{"literary_type": "Evangelio", "author": "OpenAI", "purpose": "Fallback", "historical_context": "N/A", "significance_context": "N/A"}'
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_response.choices = [mock_choice]
    
    ai_service.client.chat.completions.create.return_value = mock_response
    
    result = await ai_service.analyze_verse("Juan 3:16")
    
    assert isinstance(result, VerseExegesisResponse)
    assert result.author == "OpenAI"
    ai_service.client.chat.completions.create.assert_called_once()
