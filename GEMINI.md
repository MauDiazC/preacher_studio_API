# Preacher Studio API (Sermon Management)

A specialized homiletic mentoring platform designed to help pastors and preachers structure their sermons with AI-powered assistance.

## Project Overview

- **Purpose:** Provide a backend API for managing sermons, including creation, updates, and AI-driven suggestions.
- **Main Technologies:**
    - **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/)
    - **Database & Authentication:** [Supabase](https://supabase.com/) (PostgreSQL)
    - **AI Integration:** [Google Generative AI (Gemini 1.5 Flash)](https://ai.google.dev/)
    - **Package Management:** [uv](https://github.com/astral-sh/uv)
    - **Configuration:** [Dynaconf](https://www.dynaconf.com/) & [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
    - **Real-time:** WebSockets for live features.

## Project Structure

- `main.py`: Entry point of the FastAPI application.
- `app/api/endpoints/`: Contains API route definitions (Sermons, System, WebSockets).
- `app/services/`: Business logic layer, including `ai_service.py` for Gemini integration.
- `app/repository/`: Data access layer using the Supabase client.
- `app/schemas/`: Pydantic models for request/response validation and serialization.
- `app/core/`: Core utilities such as database connection, security (JWT/Auth), and logging.
- `config/`: Configuration management using Dynaconf.
- `db/schemas.sql`: SQL definitions for the database schema.

## Building and Running

### Prerequisites
- Python 3.14+ (as per `pyproject.toml`)
- [uv](https://github.com/astral-sh/uv) package manager

### Installation
```bash
uv sync
```

### Running the Application
```bash
uvicorn main:app --reload
```

### Environment Variables
Configure the following in `settings.toml` or via environment variables:
- `SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_KEY`: Your Supabase API key.
- `GEMINI_API_KEY`: Your Google Gemini API key.

## Development Conventions

- **AI Integration:** The project uses `gemini-1.5-flash` for homiletic suggestions. Prompts are defined in `app/services/ai_service.py`.
- **Validation:** All request and response bodies must be validated using Pydantic schemas in `app/schemas/`.
- **Database Access:** Use the repository pattern (`app/repository/`) for database operations to maintain a clean separation of concerns.
- **Security:** Protected routes use `get_current_user` dependency for JWT validation.
- **Logging:** Structured logging is implemented using `rich` for better readability in development.
- **Localization:** The codebase contains comments and error messages in Spanish, reflecting the primary target audience/developers.

## Deployment
The project includes a `Dockerfile` and `railway.json` for deployment, although they currently serve as placeholders for configuration.
