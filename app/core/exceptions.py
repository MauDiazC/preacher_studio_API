from typing import Any, Optional
from fastapi import status


class AppBaseException(Exception):
    """Base application exception."""

    message: str = "An internal error occurred."
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code: str = "ERR_INTERNAL_000"

    def __init__(self, message: Optional[str] = None, details: Optional[Any] = None):
        if message:
            self.message = message
        self.details = details
        super().__init__(self.message)


class EntityNotFoundException(AppBaseException):
    """Raised when an entity is not found in the database."""

    message = "Resource not found."
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "ERR_NOT_FOUND_001"


class AIServiceUnavailableException(AppBaseException):
    """Raised when the AI service (Gemini) fails or is unavailable."""

    message = "AI service is currently unavailable. Please try again later."
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = "ERR_AI_SERVICE_002"


class ValidationException(AppBaseException):
    """Raised when data validation fails beyond Pydantic's automatic validation."""

    message = "Data validation failed."
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "ERR_VALIDATION_003"


class AuthenticationException(AppBaseException):
    """Raised for authentication/authorization errors."""

    message = "Unauthorized access."
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "ERR_AUTH_004"
