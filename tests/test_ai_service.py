import pytest
from unittest.mock import MagicMock, patch
from app.services.ai_service import AISermonService
from app.schemas.sermon import AISuggestionResponse


@pytest.fixture
def ai_service():
    with patch("google.generativeai.configure"):
        with patch("google.generativeai.GenerativeModel"):
            return AISermonService()


@pytest.mark.asyncio
async def test_get_suggestions_success(ai_service):
    # Mock the response from Gemini
    mock_response = MagicMock()
    mock_response.text = '{"suggested_outline": ["Punto 1", "Punto 2"], "verses_found": ["Juan 3:16"], "central_theme": "Amor de Dios"}'

    with patch.object(
        ai_service.model, "generate_content", return_value=mock_response
    ) as mock_generate:
        result = await ai_service.get_suggestions(
            "Título de prueba", "Contenido de prueba"
        )

        assert isinstance(result, AISuggestionResponse)
        assert result.central_theme == "Amor de Dios"
        assert len(result.suggested_outline) == 2
        assert "Juan 3:16" in result.verses_found

        mock_generate.assert_called_once()


@pytest.mark.asyncio
async def test_get_suggestions_invalid_json(ai_service):
    # Mock invalid JSON response
    mock_response = MagicMock()
    mock_response.text = "invalid json"

    with patch.object(ai_service.model, "generate_content", return_value=mock_response):
        with pytest.raises(
            Exception
        ):  # Pydantic will raise error on model_validate_json
            await ai_service.get_suggestions("Título", "Contenido")

@pytest.mark.asyncio
async def test_get_suggestions_exception(ai_service):
    with patch.object(ai_service.model, "generate_content", side_effect=Exception("API Error")):
        with pytest.raises(Exception) as exc:
            await ai_service.get_suggestions("Title", "Content")
        assert "API Error" in str(exc.value)

@pytest.mark.asyncio
async def test_get_suggestions_academic_style(ai_service):
    mock_response = MagicMock()
    mock_response.text = '{"suggested_outline": [], "verses_found": [], "central_theme": "Academic Theme"}'
    
    with patch.object(ai_service.model, "generate_content", return_value=mock_response) as mock_generate:
        await ai_service.get_suggestions("Title", "Content", style="academic")
        
        # Verify prompt contains academic instruction
        args, kwargs = mock_generate.call_args
        prompt = args[0]
        assert "Enfócate en un análisis exegético profundo" in prompt
