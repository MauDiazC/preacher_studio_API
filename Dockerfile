# Stage 1: Build stage
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder

# Set the working directory
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Install build dependencies for:
# - lxml: libxml2-dev, libxslt-dev
# - cffi/argon2: libffi-dev
# - cryptography: libssl-dev
# - Pillow/reportlab: zlib1g-dev, libjpeg62-turbo-dev, libfreetype6-dev, libwebp-dev
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libffi-dev \
    libssl-dev \
    libxml2-dev \
    libxslt-dev \
    zlib1g-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only the files needed for installation to cache them
COPY pyproject.toml uv.lock ./

# Install the project's dependencies using the lockfile and settings
RUN uv sync --frozen --no-dev --no-install-project

# Stage 2: Final runtime stage
FROM python:3.13-slim-bookworm

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Set the working directory
WORKDIR /app

# Install runtime libraries needed by the compiled extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxml2 \
    libxslt1.1 \
    libffi8 \
    libssl3 \
    zlib1g \
    libjpeg62-turbo \
    libfreetype6 \
    libwebp7 \
    && rm -rf /var/lib/apt/lists/*

# Copy the environment from the builder
COPY --from=builder /app/.venv /app/.venv

# Add the virtual environment's bin directory to the PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE ${PORT}

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
